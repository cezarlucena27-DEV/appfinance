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
exports.PartnersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PartnersService = class PartnersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        const owned = await this.prisma.partnerAccess.findMany({
            where: { ownerId: userId },
            include: { partner: { select: { id: true, name: true, email: true } } },
        });
        const of = await this.prisma.partnerAccess.findMany({
            where: { partnerId: userId },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        return { owned, of };
    }
    async create(userId, dto) {
        const partner = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (!partner)
            throw new common_1.NotFoundException('Usuario nao encontrado');
        if (partner.id === userId)
            throw new common_1.ForbiddenException('Nao pode adicionar voce mesmo');
        const existing = await this.prisma.partnerAccess.findFirst({
            where: { ownerId: userId, partnerId: partner.id },
        });
        if (existing)
            throw new common_1.ConflictException('Parceiro ja adicionado');
        return this.prisma.partnerAccess.create({
            data: {
                ownerId: userId,
                partnerId: partner.id,
                permission: dto.permission || 'view',
                status: 'active',
            },
            include: { partner: { select: { id: true, name: true, email: true } } },
        });
    }
    async update(id, userId, dto) {
        const access = await this.prisma.partnerAccess.findFirst({
            where: { id, ownerId: userId },
        });
        if (!access)
            throw new common_1.NotFoundException('Acesso nao encontrado');
        return this.prisma.partnerAccess.update({
            where: { id },
            data: { permission: dto.permission },
        });
    }
    async remove(id, userId) {
        const access = await this.prisma.partnerAccess.findFirst({
            where: { id, ownerId: userId },
        });
        if (!access)
            throw new common_1.NotFoundException('Acesso nao encontrado');
        return this.prisma.partnerAccess.delete({ where: { id } });
    }
};
exports.PartnersService = PartnersService;
exports.PartnersService = PartnersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartnersService);
//# sourceMappingURL=partners.service.js.map