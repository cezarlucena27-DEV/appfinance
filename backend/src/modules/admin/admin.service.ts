import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { AuditService } from './audit.service';
import { OnlineTracker } from './online-tracker.service';
import { buildExcel } from '../../common/utils/excel.util';
import { getSuperAdminEmail } from '../../common/security.config';
import { parseDateOnly } from '../../common/date.util';
import { moneyNumber } from '../../common/money';

export const ADMIN_PANELS = ['overview', 'users', 'report', 'transactions', 'accounts', 'cards', 'categories', 'budgets', 'goals', 'logs', 'configs'];

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private onlineTracker: OnlineTracker,
  ) {}

  // Bloqueia qualquer acao sobre o super admin por quem nao seja o proprio
  // super admin. O ator e o proprio super admin quando seu id ou email batem.
  private assertActorIsSuperAdmin(targetEmail: string, actor: { id?: string; email?: string }) {
    const superAdminEmail = getSuperAdminEmail();
    if (!superAdminEmail || targetEmail.toLowerCase() !== superAdminEmail) return;
    const actorEmail = (actor?.email || '').toLowerCase();
    if (actorEmail === superAdminEmail) return;
    throw new ForbiddenException('Somente o super admin pode gerenciar a propria conta');
  }

  private async logAudit(actorId: string | undefined, action: string, entity: string, entityId: string, oldValues: unknown, newValues: unknown) {
    if (!actorId) return;
    try {
      await this.auditService.log(actorId, action, entity, entityId, oldValues, newValues);
    } catch (e) {
      console.error('[audit] falha ao registrar log de admin:', e instanceof Error ? e.message : e);
    }
  }

  async getStats() {
    const [totalUsers, activeUsers, totalWorkspaces, plans, totalTransactions, genderBreakdown] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.workspace.count(),
      this.prisma.workspace.groupBy({ by: ['plan'], _count: true }),
      this.prisma.transaction.count(),
      this.prisma.user.groupBy({ by: ['gender'], _count: true }),
    ]);

    return {
      totalUsers, activeUsers, totalWorkspaces, totalTransactions,
      plansBreakdown: plans.map(p => ({ plan: p.plan, count: p._count })),
      genderBreakdown: genderBreakdown.map(g => ({ gender: g.gender || 'nao_informado', count: g._count })),
    };
  }

  async getOnlineUsers() {
    const onlineIds = this.onlineTracker.getOnlineUserIds();
    const [totalActive, users] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      onlineIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: onlineIds } },
            select: {
              id: true, name: true, email: true, globalRole: true,
              memberships: { select: { role: true } },
              lastSeenAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const now = Date.now();
    const timeline = this.onlineTracker.getTimeline();
    const peakLast30Min = timeline.reduce((max, t) => Math.max(max, t.count), 0);

    return {
      onlineNow: users.filter(u => u.isActive).length,
      totalActive,
      peakLast30Min,
      timeline,
      users: users
        .filter(u => u.isActive)
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          globalRole: u.globalRole,
          role: u.memberships[0]?.role || 'member',
          lastSeenAt: u.lastSeenAt ? new Date(Math.max(u.lastSeenAt.getTime(), this.onlineTracker.getLastSeen(u.id) || 0)).toISOString() : null,
          secondsAgo: Math.floor((now - (this.onlineTracker.getLastSeen(u.id) || 0)) / 1000),
        }))
        .sort((a, b) => a.secondsAgo - b.secondsAgo),
    };
  }

  async getMonthlyReport(userId: string | undefined, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const where: any = { date: { gte: startDate, lte: endDate } };
    if (userId) where.userId = userId;

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        account: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + moneyNumber(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + moneyNumber(t.amount), 0);

    const groupByCategory = (type: string) => {
      const map = new Map<string, { category: string; color: string; total: number; count: number }>();
      for (const t of transactions) {
        if (t.type !== type) continue;
        const name = t.category?.name || 'Sem categoria';
        const color = t.category?.color || '#64748B';
        const entry = map.get(name) || { category: name, color, total: 0, count: 0 };
        entry.total += moneyNumber(t.amount);
        entry.count += 1;
        map.set(name, entry);
      }
      return [...map.values()].sort((a, b) => b.total - a.total);
    };

    return {
      month,
      year,
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      transactionCount: transactions.length,
      transactions,
      incomeByCategory: groupByCategory('income'),
      expensesByCategory: groupByCategory('expense'),
    };
  }

  async getMonthlyBalances(userId?: string, startDate?: string, endDate?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
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

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true, name: true, email: true, globalRole: true, isActive: true,
        onboardingCompleted: true, createdAt: true, lastLogin: true,
        createdById: true,
        createdBy: { select: { id: true, name: true, email: true } },
        memberships: {
          select: { workspace: { select: { id: true, name: true, plan: true } }, role: true },
        },
        _count: { select: { transactions: true, accounts: true, cards: true, budgets: true, goals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(u => {
      const m = u.memberships[0];
      return {
        ...u,
        role: m?.role || 'member',
        workspaceId: m?.workspace?.id || '',
        workspace: m?.workspace || null,
      };
    });
  }

  async getUserSummary(userId: string) {
    const [user, totalTransactions, totalIncome, totalExpenses, accounts, cards, budgets, goals] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, globalRole: true, createdAt: true },
      }),
      this.prisma.transaction.count({ where: { userId } }),
      this.prisma.transaction.aggregate({ where: { userId, type: 'income' }, _sum: { amount: true } }),
      this.prisma.transaction.aggregate({ where: { userId, type: 'expense' }, _sum: { amount: true } }),
      this.prisma.account.count({ where: { userId } }),
      this.prisma.card.count({ where: { userId } }),
      this.prisma.budget.count({ where: { userId } }),
      this.prisma.goal.count({ where: { userId } }),
    ]);

    return {
      user, totalTransactions,
      totalIncome: moneyNumber(totalIncome._sum.amount),
      totalExpenses: moneyNumber(totalExpenses._sum.amount),
      balance: moneyNumber(totalIncome._sum.amount) - moneyNumber(totalExpenses._sum.amount),
      accounts, cards, budgets, goals,
    };
  }

  async getAllTransactions(userId?: string, month?: number, year?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }
    return this.prisma.transaction.findMany({
      where, include: { category: true, account: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'desc' }, take: 200,
    });
  }

  async getAllAccounts(userId?: string) {
    return this.prisma.account.findMany({
      where: userId ? { userId } : {},
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllCards(userId?: string) {
    return this.prisma.card.findMany({
      where: userId ? { userId } : {},
      include: { user: { select: { id: true, name: true, email: true } }, account: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBudgets(userId?: string, month?: number, year?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (month && year) { where.month = month; where.year = year; }
    return this.prisma.budget.findMany({
      where, include: { category: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllGoals(userId?: string) {
    return this.prisma.goal.findMany({
      where: userId ? { userId } : {},
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllCategories(userId?: string) {
    return this.prisma.category.findMany({
      where: userId ? { userId } : {},
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string, actor: { id?: string; email?: string } = {}) {
    const validRoles = ['master', 'admin', 'member'];
    if (!validRoles.includes(role)) throw new BadRequestException('Funcao invalida');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, actor);

    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId } });
    if (membership) {
      await this.prisma.workspaceMember.update({ where: { id: membership.id }, data: { role } });
    }
    return { id: userId, role };
  }

  async updateUser(userId: string, data: { name?: string; email?: string; globalRole?: string; isActive?: boolean }, actor: { id?: string; email?: string } = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, actor);
    if (user.globalRole === 'platform_admin') {
      const targetIsSuper = !!getSuperAdminEmail() && user.email.toLowerCase() === getSuperAdminEmail();
      if (!targetIsSuper) {
        throw new ForbiddenException('Somente o super admin pode editar administradores da plataforma');
      }
    }

    const update: { name?: string; email?: string; globalRole?: string; isActive?: boolean; isAdminApproved?: boolean; adminPanels?: string } = {};

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (name.length < 2) throw new BadRequestException('Nome invalido');
      update.name = name;
    }

    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Email invalido');
      const roleSuperAdminEmail = getSuperAdminEmail();
      if (roleSuperAdminEmail && user.email.toLowerCase() === roleSuperAdminEmail && email !== roleSuperAdminEmail) {
        throw new BadRequestException('Nao e possivel alterar o email do super admin');
      }
      if (email !== user.email) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new BadRequestException('Email ja em uso');
      }
      update.email = email;
    }

    if (data.isActive !== undefined) update.isActive = Boolean(data.isActive);

    if (data.globalRole !== undefined) {
      const roleSuperAdminEmail = getSuperAdminEmail();
      if (roleSuperAdminEmail && user.email.toLowerCase() === roleSuperAdminEmail && data.globalRole !== 'platform_admin') {
        throw new BadRequestException('Nao e possivel rebaixar o super admin');
      }
      if (!['regular', 'platform_admin'].includes(data.globalRole)) {
        throw new BadRequestException('Papel global invalido');
      }
      update.globalRole = data.globalRole;
      if (data.globalRole === 'platform_admin') {
        update.isAdminApproved = false;
        update.adminPanels = '[]';
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: update,
      select: { id: true, name: true, email: true, globalRole: true, isActive: true, isAdminApproved: true, adminPanels: true },
    });
  }

  async getPendingAdmins() {
    return this.prisma.user.findMany({
      where: { globalRole: 'platform_admin', isAdminApproved: false },
      select: {
        id: true, name: true, email: true, globalRole: true, isActive: true,
        isAdminApproved: true, approvedBy: true, adminPanels: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApprovedAdmins() {
    return this.prisma.user.findMany({
      where: { globalRole: 'platform_admin', isAdminApproved: true },
      select: {
        id: true, name: true, email: true, globalRole: true, isActive: true,
        isAdminApproved: true, approvedBy: true, adminPanels: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdmin(data: { name: string; email: string }, actorEmail: string, actorId?: string) {
    const superAdminEmail = getSuperAdminEmail();
    if (!superAdminEmail || (actorEmail || '').toLowerCase() !== superAdminEmail) {
      throw new ForbiddenException('Apenas o super admin pode incluir administradores');
    }
    const email = data.email.trim().toLowerCase();
    if (!email || !data.name.trim()) throw new BadRequestException('Nome e email sao obrigatorios');
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email ja cadastrado');

    const tempPassword = randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const user = await this.prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        globalRole: 'platform_admin',
        isAdminApproved: true,
        approvedBy: actorEmail,
        adminPanels: JSON.stringify(ADMIN_PANELS),
        onboardingCompleted: true,
        defaultsCreated: true,
      },
    });
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `Workspace de ${data.name.trim()}`,
        ownerId: user.id,
        plan: 'pro',
      },
    });
    await this.prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'master' },
    });
    await this.logAudit(actorId, 'create', 'admin', user.id, null, { email, name: data.name.trim() });

    return { id: user.id, name: user.name, email: user.email, tempPassword };
  }

  async updateAdminPanels(userId: string, panels: string[], actorEmail: string, actorId?: string) {
    const superAdminEmail = getSuperAdminEmail();
    if (!superAdminEmail || (actorEmail || '').toLowerCase() !== superAdminEmail) {
      throw new ForbiddenException('Apenas o super admin pode gerenciar os paineis');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    if (user.email === superAdminEmail) {
      throw new BadRequestException('Nao e possivel restringir o super admin');
    }
    const valid = new Set(ADMIN_PANELS);
    const invalid = panels.filter((p) => !valid.has(p));
    if (invalid.length) throw new BadRequestException(`Painel invalido: ${invalid.join(', ')}`);

    const next = JSON.stringify(panels);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { adminPanels: next },
      select: { id: true, name: true, email: true, adminPanels: true },
    });
    await this.logAudit(actorId, 'update', 'admin', userId, { adminPanels: user.adminPanels }, { adminPanels: next });

    return updated;
  }

  async approveAdmin(userId: string, approverEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    if (user.globalRole !== 'platform_admin') throw new BadRequestException('Usuario nao solicitou acesso de admin');
    if (user.isAdminApproved) throw new BadRequestException('Admin ja foi aprovado');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isAdminApproved: true, approvedBy: approverEmail },
      select: { id: true, name: true, email: true, globalRole: true, isAdminApproved: true },
    });
  }

  async rejectAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    return this.prisma.user.update({
      where: { id: userId },
      data: { globalRole: 'regular', isAdminApproved: false },
      select: { id: true, name: true, email: true, globalRole: true },
    });
  }

  async revokeAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    if (getSuperAdminEmail() && user.email === getSuperAdminEmail()) {
      throw new BadRequestException('Nao e possivel revogar o super admin');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { globalRole: 'regular', isAdminApproved: false, approvedBy: null },
      select: { id: true, name: true, email: true, globalRole: true, isAdminApproved: true },
    });
  }

  async toggleUserActive(userId: string, message?: string, actor: { id?: string; email?: string } = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, actor);
    if (user.globalRole === 'platform_admin' && !(getSuperAdminEmail() && user.email.toLowerCase() === getSuperAdminEmail())) {
      throw new ForbiddenException('Somente o super admin pode ativar/desativar administradores da plataforma');
    }
    const nextActive = !user.isActive;
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: nextActive, deactivatedMessage: nextActive ? null : (message?.trim() || null) },
      select: { id: true, name: true, email: true, globalRole: true, isActive: true },
    });
  }

  async resetUserPassword(userId: string, actor: { id?: string; email?: string } = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, actor);
    if (user.globalRole === 'platform_admin' && !(getSuperAdminEmail() && user.email.toLowerCase() === getSuperAdminEmail())) {
      throw new ForbiddenException('Somente o super admin pode redefinir a senha de administradores da plataforma');
    }
    const tempPassword = randomBytes(12).toString('base64url') + 'a1';
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    return { tempPassword, email: user.email };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    if (user.globalRole === 'platform_admin') throw new BadRequestException('Nao e possivel excluir um admin da plataforma');

    await this.prisma.$transaction(async (tx) => {
      const accounts = await tx.account.findMany({ where: { userId }, select: { id: true } });
      const accountIds = accounts.map((account) => account.id);
      const categories = await tx.category.findMany({ where: { userId }, select: { id: true } });
      const categoryIds = categories.map((category) => category.id);
      const ownedWorkspaces = await tx.workspace.findMany({ where: { ownerId: userId }, select: { id: true } });
      const workspaceIds = ownedWorkspaces.map((workspace) => workspace.id);

      await tx.accountShare.deleteMany({
        where: { OR: [{ userId }, { accountId: { in: accountIds } }] },
      });
      await tx.transaction.deleteMany({
        where: { OR: [{ userId }, { accountId: { in: accountIds } }] },
      });
      await tx.budget.updateMany({
        where: { userId: { not: userId }, categoryId: { in: categoryIds } },
        data: { categoryId: null },
      });
      await tx.budget.deleteMany({ where: { userId } });
      await tx.goal.deleteMany({ where: { userId } });
      await tx.card.deleteMany({ where: { userId } });
      await tx.auditLog.deleteMany({ where: { userId } });
      await tx.paymentHistory.deleteMany({ where: { userId } });
      await tx.reminderView.deleteMany({ where: { userId } });
      await tx.category.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { userId } });
      await tx.subscription.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
      await tx.workspaceMember.deleteMany({ where: { workspaceId: { in: workspaceIds } } });
      await tx.workspace.deleteMany({ where: { id: { in: workspaceIds } } });
      await tx.user.updateMany({ where: { createdById: userId }, data: { createdById: null } });
      await tx.workspaceMember.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
    return { deleted: true, email: user.email };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, globalRole: true, isActive: true,
        onboardingCompleted: true, createdAt: true, updatedAt: true,
        gender: true, workDaysPerMonth: true, workHoursPerDay: true, weekendWork: true,
        segment: { select: { id: true, name: true } },
        memberships: { select: { workspace: { select: { id: true, name: true, plan: true } }, role: true } },
        _count: { select: { transactions: true, accounts: true, cards: true, budgets: true, goals: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    const [totalIncome, totalExpenses] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { userId, type: 'income' }, _sum: { amount: true } }),
      this.prisma.transaction.aggregate({ where: { userId, type: 'expense' }, _sum: { amount: true } }),
    ]);

    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId }, include: { category: true, account: true },
      orderBy: { date: 'desc' }, take: 10,
    });

    const accounts = await this.prisma.account.findMany({
      where: { userId }, select: { id: true, name: true, type: true, currentBalance: true, color: true },
    });

    const m = user.memberships[0];
    return {
      ...user, role: m?.role || 'member', workspaceId: m?.workspace?.id || '', workspace: m?.workspace || null,
      totalIncome: moneyNumber(totalIncome._sum.amount),
      totalExpenses: moneyNumber(totalExpenses._sum.amount),
      balance: moneyNumber(totalIncome._sum.amount) - moneyNumber(totalExpenses._sum.amount),
      recentTransactions, accounts,
    };
  }

  private getConfigPath() {
    return join(process.cwd(), 'asaas-config.json');
  }

  async getSubscriptionsFinance() {
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true, createdAt: true } },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = subscriptions.map(s => s.userId);
    const histories = await this.prisma.paymentHistory.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
    });
    const historyMap = new Map<string, typeof histories>();
    for (const h of histories) {
      const list = historyMap.get(h.userId) || [];
      list.push(h);
      historyMap.set(h.userId, list);
    }

    return subscriptions.map(s => ({
      id: s.id,
      user: s.user,
      planId: s.planId,
      planName: s.plan?.name || (s.planId === 'free' ? 'Plano Gratuito' : s.planId || '-'),
      value: s.value,
      status: s.status,
      billingDay: s.billingDay,
      nextDueDate: s.nextDueDate,
      blocked: s.blocked,
      blockReason: s.blockReason,
      accessUntil: s.accessUntil,
      paymentStatus: this.resolvePaymentStatus(s),
      payments: historyMap.get(s.userId) || [],
    }));
  }

  private resolvePaymentStatus(sub: { blocked: boolean; accessUntil: Date | null; nextDueDate: Date | null; planId: string | null }): string {
    if (sub.blocked) return 'blocked';
    if (!sub.planId || sub.planId === 'free') return 'free';
    const reference = sub.accessUntil || sub.nextDueDate;
    if (reference && new Date(reference) < new Date()) return 'overdue';
    return 'active';
  }

  async getReminderViews() {
    const views = await this.prisma.reminderView.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { viewedAt: 'desc' },
      take: 2000,
    });
    const latestByUser = new Map<string, (typeof views)[number]>();
    for (const view of views) {
      if (!latestByUser.has(view.userId)) latestByUser.set(view.userId, view);
    }
    return Array.from(latestByUser.values());
  }

  async blockUserForPayment(userId: string, reason?: string, actorEmail?: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, { id: actorId, email: actorEmail });

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) throw new NotFoundException('Assinatura nao encontrada para este usuario');

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: { blocked: true, blockReason: reason?.trim() || 'Falta de pagamento' },
    });
    await this.logAudit(actorId, 'update', 'subscription', subscription.id, null, { blocked: true });
    return updated;
  }

  async unblockUserForPayment(userId: string, accessUntil?: string, actorEmail?: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, { id: actorId, email: actorEmail });

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) throw new NotFoundException('Assinatura nao encontrada para este usuario');

    let until: Date | null = null;
    if (accessUntil) {
      until = parseDateOnly(accessUntil);
      if (!until) throw new BadRequestException('Data de acesso invalida');
    }
    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: { blocked: false, blockReason: null, accessUntil: until },
    });
    await this.logAudit(actorId, 'update', 'subscription', subscription.id, null, { blocked: false, accessUntil: until });
    return updated;
  }

  async registerPayment(userId: string, data: { amount?: number; dueDate: string; notes?: string }, actorEmail?: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    this.assertActorIsSuperAdmin(user.email, { id: actorId, email: actorEmail });

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription) throw new NotFoundException('Assinatura nao encontrada para este usuario');

    let dueDate: Date | null;
    try {
      dueDate = parseDateOnly(data.dueDate);
    } catch {
      throw new BadRequestException('Data de vencimento invalida');
    }
    if (!dueDate) throw new BadRequestException('Data de vencimento invalida');

    const plan = subscription.planId
      ? await this.prisma.plan.findUnique({ where: { id: subscription.planId } })
      : null;

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.paymentHistory.create({
        data: {
          userId,
          planId: subscription.planId,
          amount: data.amount ?? subscription.value ?? 0,
          status: 'paid',
          dueDate: dueDate as Date,
          paidAt: new Date(),
          notes: data.notes?.trim() || null,
          registeredBy: actorEmail || 'admin',
        },
      });

      await tx.subscription.update({
        where: { userId },
        data: {
          blocked: false,
          blockReason: null,
          status: 'active',
          accessUntil: dueDate as Date,
          nextDueDate: dueDate as Date,
        },
      });

      if (plan) {
        await tx.workspace.update({
          where: { id: subscription.workspaceId },
          data: { plan: plan.id },
        });
      }

      return created;
    });

    await this.logAudit(actorId, 'create', 'payment', payment.id, null, { amount: payment.amount, dueDate });
    return payment;
  }

  async getAsaasConfig() {
    const configPath = this.getConfigPath();
    if (!existsSync(configPath)) {
      return { apiKey: '', webhookUrl: '', environment: 'sandbox', pixKey: '' };
    }
    try {
      const raw = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(raw);
      return {
        apiKey: config.apiKey ? '••••••••' + config.apiKey.slice(-6) : '',
        webhookUrl: config.webhookUrl || '',
        environment: config.environment || 'sandbox',
        pixKey: config.pixKey || '',
      };
    } catch {
      return { apiKey: '', webhookUrl: '', environment: 'sandbox', pixKey: '' };
    }
  }

  async updateAsaasConfig(data: { apiKey?: string; webhookUrl?: string; environment?: string; pixKey?: string }) {
    // Configuracoes de pagamento so podem ser alteradas pelo super admin.
    throw new ForbiddenException('Apenas o super admin pode alterar configuracoes de pagamento');
    const configPath = this.getConfigPath();
    let existing: any = {};
    if (existsSync(configPath)) {
      try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {}
    }
    const incoming = { ...data };
    if (incoming.apiKey && incoming.apiKey.startsWith('••••')) {
      delete incoming.apiKey;
    }
    const config = { ...existing, ...incoming };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true, message: 'Configuracao Asaas atualizada' };
  }

  async getWorkspaces() {
    const workspaces = await this.prisma.workspace.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, isActive: true } },
          },
        },
        subscription: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workspaces.map(w => ({
      id: w.id,
      name: w.name,
      plan: w.plan,
      createdAt: w.createdAt,
      memberCount: w.members.length,
      members: w.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        isActive: m.user.isActive,
      })),
      subscription: w.subscription ? {
        plan: w.subscription.plan?.name || w.subscription.planId,
        status: w.subscription.status,
        value: w.subscription.value,
        nextDueDate: w.subscription.nextDueDate,
        billingType: w.subscription.billingType,
      } : null,
    }));
  }

  async getAllTransactionsExport(userId?: string, month?: number, year?: number, type?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }
    if (type) where.type = type;

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + moneyNumber(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + moneyNumber(t.amount), 0);

    return {
      transactions,
      summary: {
        total: transactions.length,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
    };
  }

  async exportExcel(userId?: string, month?: number, year?: number) {
    const [users, transactions, accounts, cards, budgets, goals, categories, workspaces] = await Promise.all([
      this.getUsers(),
      this.getAllTransactionsExport(userId, month, year),
      this.getAllAccounts(userId),
      this.getAllCards(userId),
      this.getAllBudgets(userId, month, year),
      this.getAllGoals(userId),
      this.getAllCategories(userId),
      this.getWorkspaces(),
    ]);

    const txs = transactions.transactions;
    const months = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    const sheets: any[] = [
      {
        name: 'Resumo',
        columns: [
          { header: 'Indicador', key: 'label', width: 24 },
          { header: 'Valor', key: 'value', width: 18 },
        ],
        rows: [
          { label: 'Usuarios', value: users.length },
          { label: 'Contas', value: accounts.length },
          { label: 'Cartoes', value: cards.length },
          { label: 'Orcamentos', value: budgets.length },
          { label: 'Metas', value: goals.length },
          { label: 'Categorias', value: categories.length },
          { label: 'Workspaces', value: workspaces.length },
          { label: 'Transacoes', value: txs.length },
          { label: 'Receitas', value: transactions.summary.totalIncome },
          { label: 'Despesas', value: transactions.summary.totalExpenses },
          { label: 'Saldo', value: transactions.summary.balance },
        ],
      },
      {
        name: 'Usuarios',
        columns: [
          { header: 'Nome', key: 'name', width: 24 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Funcao', key: 'role', width: 12 },
          { header: 'Plano', key: 'plan', width: 12 },
          { header: 'Status', key: 'status', width: 10 },
          { header: 'Criado em', key: 'createdAt', width: 12 },
          { header: 'Ultimo acesso', key: 'lastLogin', width: 16 },
          { header: 'Transacoes', key: 'transactions', width: 12 },
          { header: 'Contas', key: 'accounts', width: 10 },
        ],
        rows: users.map(u => ({
          name: u.name,
          email: u.email,
          role: u.role,
          plan: u.workspace?.plan || 'free',
          status: u.isActive ? 'Ativo' : 'Inativo',
          createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '',
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : 'Nunca',
          transactions: u._count?.transactions ?? 0,
          accounts: u._count?.accounts ?? 0,
        })),
      },
      {
        name: 'Transacoes',
        columns: [
          { header: 'Data', key: 'date', width: 12 },
          { header: 'Tipo', key: 'type', width: 10 },
          { header: 'Categoria', key: 'category', width: 18 },
          { header: 'Descricao', key: 'description', width: 30 },
          { header: 'Valor', key: 'amount', width: 14 },
          { header: 'Conta', key: 'account', width: 16 },
          { header: 'Usuario', key: 'user', width: 24 },
        ],
        rows: txs.map(t => ({
          date: t.date.toLocaleDateString('pt-BR'),
          type: t.type === 'income' ? 'Receita' : 'Despesa',
          category: t.category?.name || 'Sem categoria',
          description: t.description || '',
          amount: t.type === 'income' ? moneyNumber(t.amount) : -moneyNumber(t.amount),
          account: t.account?.name || 'Sem conta',
          user: t.user?.name || t.user?.email || '',
        })),
      },
      {
        name: 'Contas',
        columns: [
          { header: 'Conta', key: 'name', width: 24 },
          { header: 'Proprietario', key: 'owner', width: 24 },
          { header: 'Tipo', key: 'type', width: 14 },
          { header: 'Saldo', key: 'balance', width: 14 },
        ],
        rows: accounts.map(a => ({
          name: a.name,
          owner: a.user?.name || a.user?.email || '',
          type: a.type,
          balance: moneyNumber(a.currentBalance),
        })),
      },
      {
        name: 'Cartoes',
        columns: [
          { header: 'Cartao', key: 'name', width: 24 },
          { header: 'Bandeira', key: 'brand', width: 14 },
          { header: 'Final', key: 'lastDigits', width: 10 },
          { header: 'Limite', key: 'limit', width: 14 },
          { header: 'Proprietario', key: 'owner', width: 24 },
        ],
        rows: cards.map(c => ({
          name: c.name,
          brand: c.brand,
          lastDigits: c.lastDigits,
          limit: moneyNumber(c.limit),
          owner: c.user?.name || c.user?.email || '',
        })),
      },
      {
        name: 'Orcamentos',
        columns: [
          { header: 'Categoria', key: 'category', width: 24 },
          { header: 'Limite', key: 'limit', width: 14 },
          { header: 'Periodo', key: 'period', width: 14 },
          { header: 'Usuario', key: 'user', width: 24 },
        ],
        rows: budgets.map(b => ({
          category: b.category?.name || 'Sem categoria',
          limit: moneyNumber(b.limitAmount),
          period: `${months[(b.month || 1) - 1]} ${b.year}`,
          user: b.user?.name || b.user?.email || '',
        })),
      },
      {
        name: 'Metas',
        columns: [
          { header: 'Meta', key: 'name', width: 24 },
          { header: 'Atual', key: 'current', width: 14 },
          { header: 'Alvo', key: 'target', width: 14 },
          { header: 'Usuario', key: 'user', width: 24 },
        ],
        rows: goals.map(g => ({
          name: g.name,
          current: moneyNumber(g.currentAmount),
          target: moneyNumber(g.targetAmount),
          user: g.user?.name || g.user?.email || '',
        })),
      },
      {
        name: 'Categorias',
        columns: [
          { header: 'Categoria', key: 'name', width: 24 },
          { header: 'Tipo', key: 'type', width: 10 },
          { header: 'Usuario', key: 'user', width: 24 },
        ],
        rows: categories.map(c => ({
          name: c.name,
          type: c.type,
          user: c.user?.name || c.user?.email || '',
        })),
      },
      {
        name: 'Workspaces',
        columns: [
          { header: 'Workspace', key: 'name', width: 24 },
          { header: 'Plano', key: 'plan', width: 12 },
          { header: 'Membros', key: 'members', width: 10 },
          { header: 'Assinatura', key: 'subscription', width: 14 },
          { header: 'Criado em', key: 'createdAt', width: 12 },
        ],
        rows: workspaces.map(w => ({
          name: w.name,
          plan: w.plan,
          members: w.memberCount,
          subscription: w.subscription?.status || 'Sem assinatura',
          createdAt: w.createdAt.toLocaleDateString('pt-BR'),
        })),
      },
    ];

    return buildExcel(sheets);
  }
}
