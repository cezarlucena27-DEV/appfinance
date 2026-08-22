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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CardsService = class CardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.card.findMany({
            where: { userId },
            include: { account: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const card = await this.prisma.card.findFirst({
            where: { id, userId },
            include: { account: true },
        });
        if (!card) {
            throw new common_1.NotFoundException('Cartao nao encontrado');
        }
        return card;
    }
    async create(userId, dto) {
        const cardCount = await this.prisma.card.count({
            where: { userId },
        });
        const limits = { free: 2, premium: 5, pro: 999999 };
        const membership = await this.prisma.workspaceMember.findFirst({
            where: { userId },
            include: { workspace: true },
        });
        const plan = (membership?.workspace?.plan || 'free');
        if (cardCount >= limits[plan]) {
            throw new common_1.ForbiddenException('Limite de cartoes atingido para o seu plano');
        }
        return this.prisma.card.create({
            data: {
                userId,
                name: dto.name,
                brand: dto.brand || 'other',
                limit: dto.limit,
                closingDay: dto.closingDay,
                dueDay: dto.dueDay,
                accountId: dto.accountId,
            },
            include: { account: true },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.card.update({
            where: { id },
            data: dto,
            include: { account: true },
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        const transactionCount = await this.prisma.transaction.count({
            where: { cardId: id },
        });
        if (transactionCount > 0) {
            throw new common_1.ForbiddenException('Nao e possivel excluir cartao com transacoes');
        }
        return this.prisma.card.delete({
            where: { id },
        });
    }
    async getBill(cardId, userId, month, year) {
        await this.findOne(cardId, userId);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                cardId,
                type: 'expense',
                date: { gte: startDate, lte: endDate },
            },
            include: { category: true },
        });
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        const card = await this.prisma.card.findUnique({ where: { id: cardId } });
        return {
            card,
            month,
            year,
            transactions,
            total,
            availableLimit: card.limit - total,
        };
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CardsService);
//# sourceMappingURL=cards.service.js.map