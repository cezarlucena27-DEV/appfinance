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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BudgetsService = class BudgetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.budget.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const budget = await this.prisma.budget.findFirst({
            where: { id, userId },
            include: { category: true },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Budget not found');
        }
        return budget;
    }
    async create(userId, dto) {
        const budgetCount = await this.prisma.budget.count({
            where: { userId },
        });
        const limits = { free: 3, premium: 999999, pro: 999999 };
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { workspace: true },
        });
        const plan = user.workspace.plan;
        if (budgetCount >= limits[plan]) {
            throw new common_1.ForbiddenException('Budget limit reached for your plan');
        }
        const existing = await this.prisma.budget.findFirst({
            where: {
                userId,
                categoryId: dto.categoryId,
                month: dto.month,
                year: dto.year,
            },
        });
        if (existing) {
            throw new common_1.ForbiddenException('Budget already exists for this category and month');
        }
        return this.prisma.budget.create({
            data: {
                userId,
                categoryId: dto.categoryId,
                month: dto.month,
                year: dto.year,
                limitAmount: dto.limitAmount,
            },
            include: { category: true },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.budget.update({
            where: { id },
            data: dto,
            include: { category: true },
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.budget.delete({
            where: { id },
        });
    }
    async getProgress(userId) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const budgets = await this.prisma.budget.findMany({
            where: { userId, month, year },
            include: { category: true },
        });
        const results = [];
        for (const budget of budgets) {
            const transactions = await this.prisma.transaction.findMany({
                where: {
                    userId,
                    categoryId: budget.categoryId,
                    type: 'expense',
                    date: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0),
                    },
                },
            });
            const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
            const percentage = (spent / budget.limitAmount) * 100;
            results.push({
                ...budget,
                spent,
                percentage,
                isOverBudget: percentage > 100,
                isWarning: percentage >= 80 && percentage <= 100,
            });
        }
        return results;
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map