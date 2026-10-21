import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { getPlanLimits } from '../../common/plan-limits';
import { moneyNumber } from '../../common/money';

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

    const spendingMap = new Map(spending.map(s => [s.userId, moneyNumber(s._sum.amount)]));
    const incomeMap = new Map(income.map(i => [i.userId, moneyNumber(i._sum.amount)]));

    return members.map(m => ({
      ...m.user,
      role: m.role,
      totalSpending: spendingMap.get(m.user.id) || 0,
      totalIncome: incomeMap.get(m.user.id) || 0,
    }));
  }

  async inviteUser(workspaceId: string, email: string, name: string, createdById?: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace nao encontrado');
    const memberCount = await this.prisma.workspaceMember.count({ where: { workspaceId } });
    const limits = getPlanLimits(workspace.plan);

    if (memberCount >= limits.members) {
      throw new ForbiddenException('Para adicionar um usuário, faça um upgrade no seu plano');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: normalizedEmail } },
    });
    if (existingMember) throw new ConflictException('Usuario ja existe neste workspace');

    const globalExisting = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (globalExisting) throw new ConflictException('Email ja cadastrado no sistema');

    const tempPassword = randomBytes(12).toString('base64url') + 'a1';
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        globalRole: 'regular',
        createdById: createdById || null,
      },
    });

    await this.prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role: 'member' },
    });

    return { user: { id: user.id, name: user.name, email: user.email, globalRole: user.globalRole }, tempPassword };
  }

  async toggleActive(id: string, workspaceId: string, message?: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new NotFoundException('Usuario nao encontrado no workspace');
    if (membership.role === 'master') throw new BadRequestException('Nao e possivel desativar o master do workspace');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    const nextActive = !user.isActive;

    return this.prisma.user.update({
      where: { id },
      data: { isActive: nextActive, deactivatedMessage: nextActive ? null : (message?.trim() || null) },
      select: { id: true, name: true, email: true, globalRole: true, isActive: true, createdAt: true },
    });
  }

  async updateRole(id: string, workspaceId: string, role: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new NotFoundException('Usuario nao encontrado no workspace');
    if (membership.role === 'master') throw new BadRequestException('Nao e possivel alterar a funcao do master');
    if (!['admin', 'member'].includes(role)) throw new BadRequestException('Funcao invalida');

    await this.prisma.workspaceMember.update({ where: { id: membership.id }, data: { role } });
    return { id, role };
  }

  async updateUser(id: string, workspaceId: string, data: { name?: string; email?: string }) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new NotFoundException('Usuario nao encontrado no workspace');

    const update: { name?: string; email?: string } = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (name.length < 2) throw new BadRequestException('Nome invalido');
      update.name = name;
    }
    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (email) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== id) throw new ConflictException('Email ja esta em uso');
      }
      update.email = email;
    }

    return this.prisma.user.update({
      where: { id },
      data: update,
      select: { id: true, name: true, email: true, globalRole: true, isActive: true },
    });
  }

  async resetPassword(id: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new NotFoundException('Usuario nao encontrado no workspace');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    const tempPassword = randomBytes(12).toString('base64url') + 'a1';
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    return { tempPassword, email: user.email };
  }

  async deleteUser(id: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
    if (!membership) throw new NotFoundException('Usuario nao encontrado no workspace');
    if (membership.role === 'master') throw new BadRequestException('Nao e possivel excluir o master do workspace');

    const isOwner = await this.prisma.workspace.count({ where: { id: workspaceId, ownerId: id } });
    if (isOwner > 0) throw new BadRequestException('Nao e possivel excluir o proprietario do workspace');

    await this.prisma.$transaction(async (tx) => {
      const accounts = await tx.account.findMany({ where: { userId: id }, select: { id: true } });
      const accountIds = accounts.map((account) => account.id);
      const categories = await tx.category.findMany({ where: { userId: id }, select: { id: true } });
      const categoryIds = categories.map((category) => category.id);

      await tx.accountShare.deleteMany({
        where: { OR: [{ userId: id }, { accountId: { in: accountIds } }] },
      });
      await tx.transaction.deleteMany({
        where: { OR: [{ userId: id }, { accountId: { in: accountIds } }] },
      });
      await tx.budget.updateMany({
        where: { userId: { not: id }, categoryId: { in: categoryIds } },
        data: { categoryId: null },
      });
      await tx.budget.deleteMany({ where: { userId: id } });
      await tx.goal.deleteMany({ where: { userId: id } });
      await tx.card.deleteMany({ where: { userId: id } });
      await tx.auditLog.deleteMany({ where: { userId: id } });
      await tx.paymentHistory.deleteMany({ where: { userId: id } });
      await tx.reminderView.deleteMany({ where: { userId: id } });
      await tx.category.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.subscription.deleteMany({ where: { userId: id } });
      await tx.workspaceMember.deleteMany({ where: { userId: id } });
      await tx.user.updateMany({ where: { createdById: id }, data: { createdById: null } });
      await tx.user.delete({ where: { id } });
    });
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
