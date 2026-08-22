"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByWorkspace(workspaceId) {
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
    async inviteUser(workspaceId, email, name, createdById) {
        const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
        const memberCount = await this.prisma.workspaceMember.count({ where: { workspaceId } });
        const limits = { free: 1, premium: 3, pro: 999999 };
        const plan = (workspace?.plan || 'free');
        if (memberCount >= limits[plan]) {
            throw new common_1.ForbiddenException('Para adicionar um usuário, faça um upgrade no seu plano');
        }
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, user: { email } },
        });
        if (existingMember)
            throw new common_1.ConflictException('Usuario ja existe neste workspace');
        const globalExisting = await this.prisma.user.findFirst({ where: { email } });
        if (globalExisting)
            throw new common_1.ConflictException('Email ja cadastrado no sistema');
        const tempPassword = (0, crypto_1.randomBytes)(8).toString('hex');
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        const user = await this.prisma.user.create({
            data: { name, email, passwordHash, globalRole: 'regular', createdById: createdById || null },
        });
        await this.prisma.workspaceMember.create({
            data: { userId: user.id, workspaceId, role: 'member' },
        });
        return { user: { id: user.id, name: user.name, email: user.email, globalRole: user.globalRole }, tempPassword };
    }
    async updateWorkspacePlan(workspaceId, plan) {
        const validPlans = ['free', 'premium', 'pro'];
        if (!validPlans.includes(plan))
            throw new common_1.BadRequestException('Plano invalido');
        return this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { plan },
            select: { id: true, name: true, plan: true },
        });
    }
    async toggleActive(id, workspaceId, message) {
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
        if (!membership)
            throw new Error('Usuario nao encontrado no workspace');
        const user = await this.prisma.user.findUnique({ where: { id } });
        const nextActive = !user.isActive;
        return this.prisma.user.update({
            where: { id },
            data: { isActive: nextActive, deactivatedMessage: nextActive ? null : (message?.trim() || null) },
            select: { id: true, name: true, email: true, globalRole: true, isActive: true, createdAt: true },
        });
    }
    async updateRole(id, workspaceId, role) {
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
        if (!membership)
            throw new Error('Usuario nao encontrado no workspace');
        await this.prisma.workspaceMember.update({ where: { id: membership.id }, data: { role } });
        return { id, role };
    }
    async updateUser(id, workspaceId, data) {
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
        if (!membership)
            throw new Error('Usuario nao encontrado no workspace');
        if (data.email) {
            const existing = await this.prisma.user.findFirst({ where: { email: data.email, id: { not: id } } });
            if (existing)
                throw new common_1.ConflictException('Email ja esta em uso');
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, globalRole: true, isActive: true },
        });
    }
    async resetPassword(id, workspaceId) {
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
        if (!membership)
            throw new Error('Usuario nao encontrado no workspace');
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new Error('Usuario nao encontrado');
        const tempPassword = (0, crypto_1.randomBytes)(8).toString('hex');
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        await this.prisma.user.update({ where: { id }, data: { passwordHash } });
        return { tempPassword, email: user.email };
    }
    async deleteUser(id, workspaceId) {
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: id, workspaceId } });
        if (!membership)
            throw new Error('Usuario nao encontrado no workspace');
        if (membership.role === 'master')
            throw new common_1.BadRequestException('Nao e possivel excluir o master do workspace');
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
    async getWorkspaceStats(workspaceId) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map