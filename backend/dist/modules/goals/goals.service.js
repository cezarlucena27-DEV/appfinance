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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GoalsService = class GoalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.goal.findMany({
            where: { userId },
            include: { account: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const goal = await this.prisma.goal.findFirst({
            where: { id, userId },
            include: { account: true },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        return goal;
    }
    async create(userId, dto) {
        const activeGoals = await this.prisma.goal.count({
            where: { userId, status: 'active' },
        });
        const limits = { free: 1, premium: 5, pro: 999999 };
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { workspace: true },
        });
        const plan = user.workspace.plan;
        if (activeGoals >= limits[plan]) {
            throw new common_1.ForbiddenException('Goal limit reached for your plan');
        }
        return this.prisma.goal.create({
            data: {
                userId,
                name: dto.name,
                targetAmount: dto.targetAmount,
                targetDate: new Date(dto.targetDate),
                accountId: dto.accountId,
                icon: dto.icon || 'target',
                color: dto.color || '#10B981',
            },
            include: { account: true },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.goal.update({
            where: { id },
            data: {
                ...dto,
                targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
            },
            include: { account: true },
        });
    }
    async addAmount(id, userId, amount) {
        const goal = await this.findOne(id, userId);
        const newAmount = goal.currentAmount + amount;
        const status = newAmount >= goal.targetAmount ? 'completed' : goal.status;
        return this.prisma.goal.update({
            where: { id },
            data: { currentAmount: newAmount, status },
            include: { account: true },
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.goal.delete({
            where: { id },
        });
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map