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
let AccountsService = class AccountsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const account = await this.prisma.account.findFirst({
            where: { id, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async create(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { workspace: true },
        });
        const accountCount = await this.prisma.account.count({
            where: { userId },
        });
        const limits = { free: 3, premium: 10, pro: 999999 };
        const plan = user.workspace.plan;
        if (accountCount >= limits[plan]) {
            throw new common_1.ForbiddenException('Account limit reached for your plan');
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
    async remove(id, userId) {
        const account = await this.findOne(id, userId);
        const transactionCount = await this.prisma.transaction.count({
            where: { accountId: id },
        });
        if (transactionCount > 0) {
            throw new common_1.ForbiddenException('Cannot delete account with transactions');
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