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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const default_categories_1 = require("../../common/default-categories");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        await this.ensureDefaults(userId);
        return this.prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
    }
    async ensureDefaults(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { defaultsCreated: true },
        });
        if (user?.defaultsCreated)
            return;
        const existing = await this.prisma.category.findMany({
            where: { userId },
            select: { name: true, isDefault: true },
        });
        const hasDefaults = existing.some(c => c.isDefault);
        if (!hasDefaults) {
            const existingNames = new Set(existing.map(c => c.name));
            const missing = default_categories_1.DEFAULT_CATEGORIES.filter(c => !existingNames.has(c.name));
            if (missing.length) {
                await this.prisma.category.createMany({
                    data: missing.map(cat => ({ ...cat, userId })),
                });
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { defaultsCreated: true },
        });
    }
    async findOne(id, userId) {
        const category = await this.prisma.category.findFirst({
            where: { id, userId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Categoria nao encontrada');
        }
        return category;
    }
    async create(userId, dto) {
        const customCategoryCount = await this.prisma.category.count({
            where: { userId, isDefault: false },
        });
        if (customCategoryCount >= 20) {
            throw new common_1.ForbiddenException('Limite de categorias atingido para o plano Gratuito');
        }
        return this.prisma.category.create({
            data: {
                userId,
                name: dto.name,
                icon: dto.icon || 'tag',
                color: dto.color || '#64748B',
                type: dto.type,
                isDefault: dto.isDefault || false,
            },
        });
    }
    async update(id, userId, dto) {
        const category = await this.findOne(id, userId);
        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, userId) {
        const category = await this.findOne(id, userId);
        await this.prisma.transaction.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
        });
        await this.prisma.budget.updateMany({
            where: { categoryId: id },
            data: { categoryId: null },
        });
        return this.prisma.category.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map