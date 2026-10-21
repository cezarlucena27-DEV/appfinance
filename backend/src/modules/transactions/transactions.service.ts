import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { getPlanLimits } from '../../common/plan-limits';
import { balanceDelta, moneyNumber } from '../../common/money';
import { parseDateOnly } from '../../common/date.util';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

async findAll(userId: string, filters?: { startDate?: string; endDate?: string; type?: string }) {
    const ids = await this.getVisibleAccountIds(userId);
    let where: any = { accountId: { in: [...ids] } };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = parseDateOnly(filters.startDate);
      if (filters.endDate) where.date.lte = parseDateOnly(filters.endDate);
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
        card: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const ids = await this.getVisibleAccountIds(userId);
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, accountId: { in: [...ids] } },
      include: {
        account: true,
        category: true,
        card: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transacao nao encontrada');
    }

    return transaction;
  }

async create(userId: string, dto: CreateTransactionDto) {
    const account = await this.validateAccountAccess(userId, dto.accountId);
    await this.validateCategory(userId, dto.categoryId);
    if (dto.cardId) {
      const card = await this.prisma.card.findFirst({ where: { id: dto.cardId, userId } });
      if (!card) throw new ForbiddenException('Cartao nao pertence a este usuario');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactionCount = await this.prisma.transaction.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    const limits = getPlanLimits(membership?.workspace?.plan);

    if (transactionCount >= limits.transactions) {
      throw new ForbiddenException('Limite de transacoes atingido para o seu plano');
    }

    const isPaid = dto.isPaid !== false;
    const amount = new Prisma.Decimal(dto.amount);
    const date = parseDateOnly(dto.date);
    if (!date) throw new BadRequestException('Data invalida');

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          categoryId: dto.categoryId || null,
          cardId: dto.cardId || null,
          type: dto.type,
          amount,
          description: dto.description,
          date,
          isRecurring: dto.isRecurring || false,
          recurrenceType: dto.recurrenceType,
          totalInstallments: dto.totalInstallments,
          currentInstallment: 1,
          dueDate: parseDateOnly(dto.dueDate),
          isPaid,
        },
        include: {
          account: true,
          category: true,
        },
      });

      if (isPaid) {
        await tx.account.update({
          where: { id: account.id },
          data: { currentBalance: { increment: balanceDelta(dto.type, amount) } },
        });
      }

      return transaction;
    });
  }

async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(id, userId);
    if (transaction.userId !== userId) {
      throw new ForbiddenException('Apenas o autor pode alterar esta transacao');
    }

    const targetAccountId = dto.accountId || transaction.accountId;
    await this.validateAccountAccess(userId, targetAccountId);
    if (dto.categoryId !== undefined) await this.validateCategory(userId, dto.categoryId);
    if (dto.cardId) {
      const card = await this.prisma.card.findFirst({ where: { id: dto.cardId, userId } });
      if (!card) throw new ForbiddenException('Cartao nao pertence a este usuario');
    }

    const newType = dto.type || transaction.type;
    const newAmount = dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : new Prisma.Decimal(transaction.amount);
    const newIsPaid = dto.isPaid !== undefined ? dto.isPaid : transaction.isPaid;

    const data: Prisma.TransactionUpdateInput = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.accountId !== undefined) data.account = { connect: { id: targetAccountId } };
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId ? { connect: { id: dto.categoryId } } : { disconnect: true };
    }
    if (dto.cardId !== undefined) {
      data.card = dto.cardId ? { connect: { id: dto.cardId } } : { disconnect: true };
    }
    if (dto.amount !== undefined) data.amount = newAmount;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.date !== undefined) data.date = parseDateOnly(dto.date) as Date;
    if (dto.dueDate !== undefined) data.dueDate = parseDateOnly(dto.dueDate);
    if (dto.isPaid !== undefined) data.isPaid = dto.isPaid;

    return this.prisma.$transaction(async (tx) => {
      if (transaction.isPaid) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { currentBalance: { decrement: balanceDelta(transaction.type, transaction.amount) } },
        });
      }

      const updated = await tx.transaction.update({
        where: { id },
        data,
        include: { account: true, category: true },
      });

      if (newIsPaid) {
        await tx.account.update({
          where: { id: targetAccountId },
          data: { currentBalance: { increment: balanceDelta(newType, newAmount) } },
        });
      }

      return updated;
    });
  }

async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (transaction.userId !== userId) {
      throw new ForbiddenException('Apenas o autor pode excluir esta transacao');
    }

    return this.prisma.$transaction(async (tx) => {
      if (transaction.isPaid) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { currentBalance: { decrement: balanceDelta(transaction.type, transaction.amount) } },
        });
      }
      return tx.transaction.delete({ where: { id } });
    });
  }

  private async validateAccountAccess(userId: string, accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { shares: true },
    });
    if (!account) throw new NotFoundException('Conta nao encontrada');
    if (account.userId === userId) return account;

    const isLinkedUser = account.shares.some(s => s.userId === userId);
    if (isLinkedUser) {
      const membership = await this.prisma.workspaceMember.findFirst({ where: { userId } });
      const ownerMembership = await this.prisma.workspaceMember.findFirst({
        where: { userId: account.userId },
      });
      if (membership && ownerMembership && membership.workspaceId === ownerMembership.workspaceId) {
        return account;
      }
    }

    throw new ForbiddenException('Conta nao pertence a este usuario');
  }

  private async validateCategory(userId: string, categoryId?: string | null) {
    if (!categoryId) return;
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw new ForbiddenException('Categoria nao pertence a este usuario');
  }

  async getMonthlyBalances(userId: string, startDate?: string, endDate?: string) {
    const ids = await this.getVisibleAccountIds(userId);
    let where: any = { accountId: { in: [...ids] } };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = /^\d{4}-\d{2}$/.test(startDate)
          ? new Date(Number(startDate.slice(0, 4)), Number(startDate.slice(5, 7)) - 1, 1, 0, 0, 0)
          : new Date(startDate);
      }
      if (endDate) {
        where.date.lte = /^\d{4}-\d{2}$/.test(endDate)
          ? new Date(Number(endDate.slice(0, 4)), Number(endDate.slice(5, 7)), 0, 23, 59, 59)
          : new Date(endDate);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      select: { date: true, type: true, amount: true },
      orderBy: { date: 'asc' },
    });

    const byMonth = new Map<string, { income: number; expenses: number }>();
    for (const t of transactions) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const entry = byMonth.get(key) || { income: 0, expenses: 0 };
      if (t.type === 'income') entry.income += moneyNumber(t.amount);
      else if (t.type === 'expense') entry.expenses += moneyNumber(t.amount);
      byMonth.set(key, entry);
    }

    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({
        month,
        label: new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1)
          .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
          .replace('.', ''),
        income: v.income,
        expenses: v.expenses,
        balance: v.income - v.expenses,
      }));
  }

async getMonthlySummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const visibleIds = await this.getVisibleAccountIds(userId);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: { in: [...visibleIds] },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + moneyNumber(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + moneyNumber(t.amount), 0);

    return { income, expenses, balance: income - expenses };
  }

  private async getVisibleAccountIds(userId: string) {
    const own = await this.prisma.account.findMany({ where: { userId }, select: { id: true } });
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      select: { workspaceId: true },
    });

    const shares = await this.prisma.accountShare.findMany({
      where: {
        userId,
        ...(membership
          ? { account: { user: { memberships: { some: { workspaceId: membership.workspaceId } } } } }
          : {}),
      },
      select: { accountId: true },
    });

    const visibleIds = new Set<string>(own.map(a => a.id));
    for (const share of shares) visibleIds.add(share.accountId);
    return visibleIds;
  }

async getByCategory(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const ids = await this.getVisibleAccountIds(userId);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: { in: [...ids] },
        type: 'expense',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true },
    });

    const byCategory = transactions.reduce((acc, t) => {
      const catName = t.category?.name || 'Sem categoria';
      if (!acc[catName]) acc[catName] = { name: catName, color: t.category?.color || '#64748B', total: 0 };
      acc[catName].total += moneyNumber(t.amount);
      return acc;
    }, {} as Record<string, { name: string; color: string; total: number }>);

    return Object.values(byCategory);
  }

  async findUpcoming(userId: string, days: number = 30) {
    const ids = await this.getVisibleAccountIds(userId);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: { in: [...ids] },
        type: 'expense',
        isPaid: false,
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        account: true,
        category: true,
        card: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return transactions;
  }

  async findOverdue(userId: string) {
    const ids = await this.getVisibleAccountIds(userId);
    const now = new Date();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: { in: [...ids] },
        type: 'expense',
        isPaid: false,
        dueDate: {
          lt: now,
        },
      },
      include: {
        account: true,
        category: true,
        card: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return transactions;
  }

  async getAlerts(userId: string) {
    const [overdue, upcoming] = await Promise.all([
      this.findOverdue(userId),
      this.findUpcoming(userId, 7),
    ]);

    const overdueTotal = overdue.reduce((sum, t) => sum + moneyNumber(t.amount), 0);
    const upcomingTotal = upcoming.reduce((sum, t) => sum + moneyNumber(t.amount), 0);

    return {
      overdueCount: overdue.length,
      overdueTotal,
      upcomingCount: upcoming.length,
      upcomingTotal,
      upcomingDays: 7,
    };
  }

  async recalculateAccountBalance(accountId: string, userId: string) {
    const account = await this.validateAccountAccess(userId, accountId);
    if (account.userId !== userId) {
      throw new ForbiddenException('Apenas o proprietario pode recalcular o saldo');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
        isPaid: true,
      },
      select: { type: true, amount: true },
    });

    let calculatedBalance = new Prisma.Decimal(account.initialBalance);
    for (const t of transactions) {
      calculatedBalance = calculatedBalance.plus(balanceDelta(t.type, t.amount));
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: calculatedBalance },
    });

    return { accountId, calculatedBalance: moneyNumber(calculatedBalance) };
  }
}
