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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const excel_util_1 = require("../../common/utils/excel.util");
let AccountsService = class AccountsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        const membership = await this.prisma.workspaceMember.findFirst({
            where: { userId },
            include: {
                workspace: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, name: true, email: true } } },
                        },
                    },
                },
            },
        });
        const own = await this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { shares: { include: { user: { select: { id: true, name: true, email: true } } } } },
        });
        let shared = [];
        let mirrored = [];
        let members = [];
        if (membership) {
            members = membership.workspace.members;
            shared = await this.prisma.account.findMany({
                where: { shares: { some: { userId } }, NOT: { userId } },
                orderBy: { createdAt: 'desc' },
                include: { shares: { include: { user: { select: { id: true, name: true, email: true } } } } },
            });
            const sharesByMe = await this.prisma.accountShare.findMany({
                where: { account: { userId } },
                select: { userId: true },
            });
            const partnerIds = [...new Set(sharesByMe.map(s => s.userId))];
            if (partnerIds.length) {
                mirrored = await this.prisma.account.findMany({
                    where: { userId: { in: partnerIds }, NOT: { userId } },
                    orderBy: { createdAt: 'desc' },
                    include: { shares: { include: { user: { select: { id: true, name: true, email: true } } } } },
                });
            }
        }
        const all = [...new Map([...own, ...shared, ...mirrored].map(a => [a.id, a])).values()];
        const allIds = all.map(a => a.id);
        const allShares = allIds.length
            ? await this.prisma.accountShare.findMany({
                where: { accountId: { in: allIds } },
                select: { accountId: true, userId: true },
            })
            : [];
        const adj = new Map();
        for (const s of allShares) {
            for (const a of all) {
                if (a.id !== s.accountId && a.userId === s.userId) {
                    adj.set(s.accountId, [...(adj.get(s.accountId) || []), a.id]);
                    adj.set(a.id, [...(adj.get(a.id) || []), s.accountId]);
                }
            }
        }
        const groupOf = (id) => {
            const seen = new Set([id]);
            const queue = [id];
            while (queue.length) {
                const cur = queue.pop();
                for (const n of adj.get(cur) || []) {
                    if (!seen.has(n)) {
                        seen.add(n);
                        queue.push(n);
                    }
                }
            }
            return [...seen];
        };
        const groupedAccountIds = [...new Set(all.flatMap(a => groupOf(a.id)))];
        const txns = groupedAccountIds.length
            ? await this.prisma.transaction.findMany({
                where: { accountId: { in: groupedAccountIds } },
                select: { userId: true, accountId: true, type: true, amount: true },
            })
            : [];
        const map = new Map(all.map(a => [a.id, a]));
        return all.map(({ shares, ...account }) => {
            const sharedWith = shares.map(s => s.user);
            const group = groupOf(account.id);
            const groupAccounts = group.map(gid => map.get(gid));
            const isGroup = group.length > 1 || sharedWith.length > 0;
            const groupBalance = groupAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
            const linkedWith = groupAccounts
                .filter(a => a.id !== account.id)
                .map(a => ({ id: a.id, name: a.name, color: a.color, currentBalance: a.currentBalance }));
            if (!isGroup)
                return account;
            const userIds = new Set();
            for (const a of groupAccounts)
                userIds.add(a.userId);
            for (const a of groupAccounts)
                for (const s of a.shares)
                    userIds.add(s.userId);
            const breakdownUsers = members.filter(m => userIds.has(m.userId));
            const groupTxns = txns.filter(t => group.includes(t.accountId));
            const breakdown = breakdownUsers.map(m => {
                const userTxns = groupTxns.filter(t => t.userId === m.userId);
                const income = userTxns
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expenses = userTxns
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                const isOwner = groupAccounts.some(a => a.userId === m.userId);
                const initialShare = groupAccounts
                    .filter(a => a.userId === m.userId)
                    .reduce((sum, a) => sum + a.initialBalance, 0);
                return {
                    id: m.userId,
                    name: m.user.name,
                    email: m.user.email,
                    income,
                    expenses,
                    available: income - expenses + initialShare,
                    isOwner,
                };
            });
            return { ...account, sharedWith, linkedWith, groupBalance, sharedUsers: breakdown };
        });
    }
    async getWorkspaceAccounts(masterUserId) {
        const membership = await this.prisma.workspaceMember.findFirst({
            where: { userId: masterUserId },
            include: { workspace: { include: { members: true } } },
        });
        if (!membership || membership.role !== 'master') {
            throw new common_1.ForbiddenException('Apenas o usuario master pode acessar as contas do workspace');
        }
        const memberIds = membership.workspace.members
            .filter(m => m.userId !== masterUserId)
            .map(m => m.userId);
        if (!memberIds.length)
            return [];
        const accounts = await this.prisma.account.findMany({
            where: { userId: { in: memberIds } },
            orderBy: { createdAt: 'desc' },
            include: {
                shares: { include: { user: { select: { id: true, name: true, email: true } } } },
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { transactions: true } },
            },
        });
        return accounts.map(({ shares, user, _count, ...account }) => ({
            ...account,
            owner: { id: user.id, name: user.name, email: user.email },
            transactionCount: _count.transactions,
            linkedToMaster: shares.some(s => s.userId === masterUserId),
            sharedWith: shares.map(s => s.user),
        }));
    }
    async getAccountTransactions(masterUserId, accountId) {
        const membership = await this.prisma.workspaceMember.findFirst({
            where: { userId: masterUserId },
            include: { workspace: { include: { members: true } } },
        });
        if (!membership || membership.role !== 'master') {
            throw new common_1.ForbiddenException('Apenas o usuario master pode acessar movimentacoes de contas');
        }
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        if (!account)
            throw new common_1.NotFoundException('Conta nao encontrada');
        const ownerIsMember = membership.workspace.members.some(m => m.userId === account.userId);
        if (!ownerIsMember) {
            throw new common_1.NotFoundException('Conta nao encontrada no workspace');
        }
        const transactions = await this.prisma.transaction.findMany({
            where: { accountId },
            include: {
                category: true,
                card: true,
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { date: 'desc' },
        });
        return {
            account: { id: account.id, name: account.name, type: account.type, currentBalance: account.currentBalance, owner: account.user },
            transactions,
        };
    }
    async exportWorkspaceExcel(masterUserId) {
        const membership = await this.prisma.workspaceMember.findFirst({
            where: { userId: masterUserId },
            include: { workspace: { include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } } } },
        });
        if (!membership || membership.role !== 'master') {
            throw new common_1.ForbiddenException('Apenas o usuario master pode exportar os dados do workspace');
        }
        const workspace = membership.workspace;
        const memberIds = workspace.members.map(m => m.userId);
        const [accounts, shares, allTransactions] = await Promise.all([
            this.prisma.account.findMany({
                where: { userId: { in: memberIds } },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    _count: { select: { transactions: true } },
                },
            }),
            this.prisma.accountShare.findMany({
                where: { account: { userId: { in: memberIds } } },
                include: { account: { select: { id: true, name: true, userId: true } }, user: { select: { name: true, email: true } } },
            }),
            this.prisma.transaction.findMany({
                where: { user: { memberships: { some: { workspaceId: workspace.id } } } },
                include: {
                    category: true,
                    account: { select: { id: true, name: true } },
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { date: 'desc' },
            }),
        ]);
        const incomeSum = allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenseSum = allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const sheets = [
            {
                name: 'Resumo',
                columns: [
                    { header: 'Indicador', key: 'label', width: 22 },
                    { header: 'Valor', key: 'value', width: 18 },
                ],
                rows: [
                    { label: 'Workspace', value: workspace.name },
                    { label: 'Plano', value: workspace.plan },
                    { label: 'Usuarios', value: workspace.members.length },
                    { label: 'Contas', value: accounts.length },
                    { label: 'Transacoes', value: allTransactions.length },
                    { label: 'Receitas', value: incomeSum },
                    { label: 'Despesas', value: expenseSum },
                    { label: 'Saldo', value: incomeSum - expenseSum },
                ],
            },
            {
                name: 'Usuarios',
                columns: [
                    { header: 'Nome', key: 'name', width: 24 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Funcao', key: 'role', width: 12 },
                ],
                rows: workspace.members.map(m => ({
                    name: m.user.name,
                    email: m.user.email,
                    role: m.role,
                })),
            },
            {
                name: 'Contas',
                columns: [
                    { header: 'Conta', key: 'name', width: 24 },
                    { header: 'Proprietario', key: 'owner', width: 24 },
                    { header: 'Tipo', key: 'type', width: 14 },
                    { header: 'Saldo', key: 'balance', width: 14 },
                    { header: 'Transacoes', key: 'transactions', width: 12 },
                ],
                rows: accounts.map(a => ({
                    name: a.name,
                    owner: a.user.name || a.user.email,
                    type: a.type,
                    balance: a.currentBalance,
                    transactions: a._count.transactions,
                })),
            },
            {
                name: 'Vinculacoes',
                columns: [
                    { header: 'Conta', key: 'account', width: 24 },
                    { header: 'Usuario Vinculado', key: 'user', width: 30 },
                ],
                rows: shares.map(s => ({
                    account: s.account.name,
                    user: s.user.name || s.user.email,
                })),
            },
            {
                name: 'Movimentacoes',
                columns: [
                    { header: 'Data', key: 'date', width: 12 },
                    { header: 'Tipo', key: 'type', width: 10 },
                    { header: 'Categoria', key: 'category', width: 18 },
                    { header: 'Descricao', key: 'description', width: 30 },
                    { header: 'Valor', key: 'amount', width: 14 },
                    { header: 'Conta', key: 'account', width: 16 },
                    { header: 'Usuario', key: 'user', width: 20 },
                ],
                rows: allTransactions.map(t => ({
                    date: t.date.toLocaleDateString('pt-BR'),
                    type: t.type === 'income' ? 'Receita' : 'Despesa',
                    category: t.category?.name || 'Sem categoria',
                    description: t.description || '',
                    amount: t.type === 'income' ? t.amount : -t.amount,
                    account: t.account?.name || 'Sem conta',
                    user: t.user?.name || t.user?.email || '',
                })),
            },
        ];
        return (0, excel_util_1.buildExcel)(sheets);
    }
    async findOne(id, userId) {
        const account = await this.prisma.account.findUnique({
            where: { id },
            include: { shares: true },
        });
        if (!account) {
            throw new common_1.NotFoundException('Conta nao encontrada');
        }
        if (account.userId !== userId) {
            const isShared = account.shares.some(s => s.userId === userId);
            const ownerSharedWithMe = !isShared
                ? await this.prisma.accountShare.findFirst({
                    where: { account: { userId }, userId: account.userId },
                })
                : null;
            if (!isShared && !ownerSharedWithMe) {
                throw new common_1.NotFoundException('Conta nao encontrada');
            }
            const membership = await this.prisma.workspaceMember.findFirst({
                where: { userId },
                include: { workspace: { include: { members: true } } },
            });
            const ownerMembership = await this.prisma.workspaceMember.findFirst({
                where: { userId: account.userId },
            });
            if (!membership || !ownerMembership || membership.workspaceId !== ownerMembership.workspaceId) {
                throw new common_1.NotFoundException('Conta nao encontrada');
            }
        }
        return account;
    }
    async create(userId, dto) {
        const membership = await this.prisma.workspaceMember.findFirst({
            where: { userId },
            include: { workspace: true },
        });
        const accountCount = await this.prisma.account.count({
            where: { userId },
        });
        const limits = { free: 1, premium: 3, pro: 999999 };
        const plan = (membership?.workspace?.plan || 'free');
        if (accountCount >= limits[plan]) {
            throw new common_1.ForbiddenException('Limite de contas atingido para o seu plano');
        }
        return this.prisma.account.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type || 'wallet',
                initialBalance: dto.initialBalance,
                currentBalance: dto.initialBalance,
                icon: dto.icon || 'wallet',
                color: dto.color || '#2563EB',
                isPrimary: dto.isPrimary || false,
            },
        });
    }
    async update(id, userId, dto) {
        const account = await this.findOne(id, userId);
        return this.prisma.account.update({
            where: { id },
            data: dto,
        });
    }
    async linkAccount(id, ownerUserId, targetUserId) {
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account)
            throw new common_1.NotFoundException('Conta nao encontrada');
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: ownerUserId } });
        if (!membership || membership.role !== 'master') {
            throw new common_1.ForbiddenException('Apenas o usuario master pode vincular contas');
        }
        if (account.userId !== ownerUserId) {
            throw new common_1.ForbiddenException('Somente o proprietario da conta pode vincula-la');
        }
        if (account.userId === targetUserId) {
            throw new common_1.ForbiddenException('A conta ja pertence a este usuario');
        }
        const targetMembership = await this.prisma.workspaceMember.findFirst({
            where: { userId: targetUserId, workspaceId: membership.workspaceId },
        });
        if (!targetMembership) {
            throw new common_1.ForbiddenException('O usuario deve ser membro do workspace');
        }
        const existing = await this.prisma.accountShare.findUnique({
            where: { accountId_userId: { accountId: id, userId: targetUserId } },
        });
        if (existing)
            return existing;
        return this.prisma.accountShare.create({
            data: { accountId: id, userId: targetUserId },
        });
    }
    async unlinkAccount(id, ownerUserId, targetUserId) {
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account)
            throw new common_1.NotFoundException('Conta nao encontrada');
        const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: ownerUserId } });
        if (!membership || membership.role !== 'master') {
            throw new common_1.ForbiddenException('Apenas o usuario master pode desvincular contas');
        }
        if (account.userId !== ownerUserId) {
            throw new common_1.ForbiddenException('Somente o proprietario da conta pode desvincula-la');
        }
        await this.prisma.accountShare.deleteMany({
            where: { accountId: id, userId: targetUserId },
        });
        return { message: 'Conta desvinculada' };
    }
    async remove(id, userId) {
        const account = await this.findOne(id, userId);
        const transactionCount = await this.prisma.transaction.count({
            where: { accountId: id },
        });
        if (transactionCount > 0) {
            throw new common_1.ForbiddenException('Nao e possivel excluir conta com transacoes');
        }
        return this.prisma.account.delete({
            where: { id },
        });
    }
    async getBalance(userId) {
        const accounts = await this.prisma.account.findMany({
            where: { userId },
        });
        return accounts.reduce((total, account) => total + account.currentBalance, 0);
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map