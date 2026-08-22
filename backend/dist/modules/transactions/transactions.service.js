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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, filters) {
        const where = { userId };
        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate)
                where.date.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.date.lte = new Date(filters.endDate);
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
            },
            orderBy: { date: 'desc' },
        });
    }
    async findOne(id, userId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, userId },
            include: {
                account: true,
                category: true,
                card: true,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async create(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
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
        const plan = user.workspace.plan;
        if (transactionCount >= limits[plan]) {
            throw new common_1.ForbiddenException('Transaction limit reached for your plan');
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
        await this.updateAccountBalance(dto.accountId, dto.type, dto.amount);
        return transaction;
    }
    async update(id, userId, dto) {
        const transaction = await this.findOne(id, userId);
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
        await this.updateAccountBalance(updated.accountId, updated.type, updated.amount);
        return updated;
    }
    async remove(id, userId) {
        const transaction = await this.findOne(id, userId);
        await this.updateAccountBalance(transaction.accountId, transaction.type, -transaction.amount);
        return this.prisma.transaction.delete({
            where: { id },
        });
    }
    async updateAccountBalance(accountId, type, amount) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        let newBalance = account.currentBalance;
        if (type === 'income') {
            newBalance += amount;
        }
        else if (type === 'expense') {
            newBalance -= amount;
        }
        await this.prisma.account.update({
            where: { id: accountId },
            data: { currentBalance: newBalance },
        });
    }
    async getMonthlySummary(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
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
    async getByCategory(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                type: 'expense',
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: { category: true },
        });
        const byCategory = transactions.reduce((acc, t) => {
            const catName = t.category.name;
            if (!acc[catName])
                acc[catName] = { name: catName, color: t.category.color, total: 0 };
            acc[catName].total += t.amount;
            return acc;
        }, {});
        return Object.values(byCategory);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map