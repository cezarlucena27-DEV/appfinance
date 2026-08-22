import { Injectable, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllByWorkspace(workspaceId: string) {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, globalRole: true, isActive: true, createdAt: true,
            createdById: true,
            createdBy: { select: { id: true, name: true, email: true } },
            _count: { select: { transactions: true, accounts: true, cards: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const userIds = members.map(m => m.user.id);

    const [spending, income] = await Promise.all([
      this.prisma.transaction.groupBy({ by: ['userId'], where: { userId: { in: userIds }, type: 'expense' }, _sum: { amount: true } }),
      this.prisma.transaction.groupBy({ by: ['userId'], where: { userId: { in: userIds }, type: 'income' }, _sum: { amount: true } }),
    ]);

    const spendingMap = new Map(spending.map(s => [s.userId, s._sum.amount || 0]));
    const incomeMap = new Map(income.map(i => [i.userId, i._sum.amount || 0]));

    return members.map(m => ({
      ...m.user,
      role: m.role,
      totalSpending: spendingMap.get(m.user.id) || 0,
      totalIncome: incomeMap.get(m.user.id) || 0,
    }));
  }

  async inviteUser(workspaceId: string, email: string, name: string, createdById?: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    const memberCount = await this.prisma.workspaceMember.count({ where: { workspaceId } });

    const limits = { free: 1, premium: 3, pro: 999999 };
    const plan = (workspace?.plan || 'free') as keyof typeof limits;

    if (memberCount >= limits[plan]) {
      throw new ForbiddenException('Para adicionar um usuário, faça um upgrade no seu plano');
    }

    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email } },
    });
    if (existingMember) throw new ConflictException('Usuario ja existe neste workspace');

    const globalExisting = await this.prisma.user.findFirst({ where: { email } });
    if (globalExisting) throw new ConflictException('Email ja cadastrado no sistema');

    const tempPassword = randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: { name, email, passwordHash, globalRole: 'regular', createdById: createdById || null },
    });

    await this.prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role: 'member' },
    });

    return { user: { id: user.id, name: user.name, email: user.email, globalRole: user.globalRole }, tempPassword };
  }

  async updateWorkspacePlan(workspaceId: string, plan: string) {
    const validPlans = ['free', 'premium', 'pro'];
    if (!validPlans.includes(plan)) throw new BadRequestException('Plano invalido');

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan },
      select: { id: true, name: true, plan: true },
    });
  }

  async toggleActive(id: string, workspaceId: string, message?: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new Error('Usuario nao encontrado no workspace');
    const user = await this.prisma.user.findUnique({ where: { id } });
    const nextActive = !user.isActive;

    return this.prisma.user.update({
      where: { id },
      data: { isActive: nextActive, deactivatedMessage: nextActive ? null : (message?.trim() || null) },
      select: { id: true, name: true, email: true, globalRole: true, isActive: true, createdAt: true },
    });
  }

  async updateRole(id: string, workspaceId: string, role: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new Error('Usuario nao encontrado no workspace');

    await this.prisma.workspaceMember.update({ where: { id: membership.id }, data: { role } });
    return { id, role };
  }

  async updateUser(id: string, workspaceId: string, data: { name?: string; email?: string }) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new Error('Usuario nao encontrado no workspace');

    if (data.email) {
      const existing = await this.prisma.user.findFirst({ where: { email: data.email, id: { not: id } } });
      if (existing) throw new ConflictException('Email ja esta em uso');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, globalRole: true, isActive: true },
    });
  }

  async resetPassword(id: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new Error('Usuario nao encontrado no workspace');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('Usuario nao encontrado');

    const tempPassword = randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { tempPassword, email: user.email };
  }

  async deleteUser(id: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new Error('Usuario nao encontrado no workspace');

    if (membership.role === 'master') throw new BadRequestException('Nao e possivel excluir o master do workspace');

    await this.prisma.workspaceMember.deleteMany({ where: { userId: id } });
    await this.prisma.auditLog.deleteMany({ where: { userId: id } });
    await this.prisma.transaction.deleteMany({ where: { userId: id } });
    await this.prisma.budget.deleteMany({ where: { userId: id } });
    await this.prisma.goal.deleteMany({ where: { userId: id } });
    await this.prisma.card.deleteMany({ where: { userId: id } });
    await this.prisma.category.deleteMany({ where: { userId: id } });
    await this.prisma.account.deleteMany({ where: { userId: id } });
    await this.prisma.subscription.deleteMany({ where: { userId: id } });
    const ownedWorkspaces = await this.prisma.workspace.findMany({ where: { ownerId: id }, select: { id: true } });
    for (const ws of ownedWorkspaces) {
      await this.prisma.subscription.deleteMany({ where: { workspaceId: ws.id } });
      await this.prisma.workspaceMember.deleteMany({ where: { workspaceId: ws.id } });
      await this.prisma.workspace.delete({ where: { id: ws.id } });
    }
    await this.prisma.user.updateMany({ where: { createdById: id }, data: { createdById: null } });
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async getWorkspaceStats(workspaceId: string) {
    const members = await this.prisma.workspaceMember.findMany({ where: { workspaceId } });
    const userIds = members.map(m => m.userId);

    const [totalUsers, activeUsers, totalTransactions, totalAccounts, workspace] = await Promise.all([
      this.prisma.user.count({ where: { id: { in: userIds } } }),
      this.prisma.user.count({ where: { id: { in: userIds }, isActive: true } }),
      this.prisma.transaction.count({ where: { userId: { in: userIds } } }),
      this.prisma.account.count({ where: { userId: { in: userIds } } }),
      this.prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true, plan: true, createdAt: true } }),
    ]);

    return { workspace, totalUsers, activeUsers, totalTransactions, totalAccounts };
  }
}
