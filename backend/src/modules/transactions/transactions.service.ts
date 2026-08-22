import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

async findAll(userId: string, filters?: { startDate?: string; endDate?: string; type?: string }) {
    const ids = await this.getVisibleAccountIds(userId);
    let where: any = { accountId: { in: [...ids] } };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
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
    if (dto.cardId) {
      const card = await this.prisma.card.findFirst({ where: { id: dto.cardId, userId } });
      if (!card) throw new ForbiddenException('Cartao nao pertence a este usuario');
    }

    if (dto.type === 'expense' && account.currentBalance + 0.009 < dto.amount) {
      throw new BadRequestException(
        `Saldo insuficiente na conta "${account.name}". Disponivel: R$ ${account.currentBalance.toFixed(2)}, despesa: R$ ${dto.amount.toFixed(2)}.`
      );
    }

    // Check transaction limit based on plan
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

    const limits = { free: 50, premium: 999999, pro: 999999 };
    const plan = (membership?.workspace?.plan || 'free') as keyof typeof limits;
    
    if (transactionCount >= limits[plan]) {
      throw new ForbiddenException('Limite de transacoes atingido para o seu plano');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        cardId: dto.cardId,
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        date: new Date(dto.date),
        isRecurring: dto.isRecurring || false,
        recurrenceType: dto.recurrenceType,
        totalInstallments: dto.totalInstallments,
        currentInstallment: 1,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        isPaid: dto.isPaid !== false,
      },
      include: {
        account: true,
        category: true,
      },
    });

    // Update account balance
    await this.updateAccountBalance(dto.accountId, dto.type, dto.amount);

    return transaction;
  }

async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(id, userId);

    const targetAccountId = dto.accountId || transaction.accountId;
    await this.validateAccountAccess(userId, targetAccountId);

    // Block expense greater than the projected balance after reversing the old effect
    const newType = dto.type || transaction.type;
    const newAmount = dto.amount ?? transaction.amount;
    if (newType === 'expense') {
      const target = await this.prisma.account.findUnique({ where: { id: targetAccountId } });
      let projected = target.currentBalance;
      if (transaction.accountId === targetAccountId) {
        if (transaction.type === 'expense') projected += transaction.amount;
        else if (transaction.type === 'income') projected -= transaction.amount;
      }
      if (projected + 0.009 < newAmount) {
        throw new BadRequestException(
          `Saldo insuficiente na conta "${target.name}". Disponivel apos alteracao: R$ ${projected.toFixed(2)}, despesa: R$ ${Number(newAmount).toFixed(2)}.`
        );
      }
    }

    // Reverse old balance effect
    await this.updateAccountBalance(transaction.accountId, transaction.type, -transaction.amount);

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        account: true,
        category: true,
      },
    });

    // Apply new balance effect
    await this.updateAccountBalance(updated.accountId, updated.type, updated.amount);

    return updated;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // Reverse balance effect
    await this.updateAccountBalance(transaction.accountId, transaction.type, -transaction.amount);

    return this.prisma.transaction.delete({
      where: { id },
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
    const ownerSharedWithMe = !isLinkedUser
      ? await this.prisma.accountShare.findFirst({
          where: { account: { userId }, userId: account.userId },
        })
      : null;
    if (isLinkedUser || ownerSharedWithMe) {
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

  private async updateAccountBalance(accountId: string, type: string, amount: number) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    let newBalance = account.currentBalance;
    
    if (type === 'income') {
      newBalance += amount;
    } else if (type === 'expense') {
      newBalance -= amount;
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: newBalance },
    });
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
      if (t.type === 'income') entry.income += t.amount;
      else if (t.type === 'expense') entry.expenses += t.amount;
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
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const visibleIds = await this.getVisibleAccountIds(userId);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: { in: [...visibleIds] },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  }

  private async getVisibleAccountIds(userId: string) {
    const own = await this.prisma.account.findMany({ where: { userId }, select: { id: true } });
    const shares = await this.prisma.accountShare.findMany({ where: { userId }, select: { accountId: true } });
    const sharesByMe = await this.prisma.accountShare.findMany({
      where: { account: { userId } },
      select: { userId: true },
    });

    const visibleIds = new Set<string>(own.map(a => a.id));
    for (const s of shares) visibleIds.add(s.accountId);
    const partnerIds = [...new Set(sharesByMe.map(s => s.userId))];
    if (partnerIds.length) {
      const partnerAccounts = await this.prisma.account.findMany({
        where: { userId: { in: partnerIds } },
        select: { id: true },
      });
      for (const a of partnerAccounts) visibleIds.add(a.id);
    }
    return visibleIds;
  }

  async getByCategory(userId: string) {
const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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
      const catName = t.category.name;
      if (!acc[catName]) acc[catName] = { name: catName, color: t.category.color, total: 0 };
      acc[catName].total += t.amount;
      return acc;
    }, {});

    return Object.values(byCategory);
  }
}
