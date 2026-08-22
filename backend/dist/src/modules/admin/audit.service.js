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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(userId, action, entity, entityId, oldValues, newValues, ip, userAgent) {
        return this.prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                oldValues: oldValues ? JSON.stringify(oldValues) : null,
                newValues: newValues ? JSON.stringify(newValues) : null,
                ipAddress: ip || null,
                userAgent: userAgent || null,
            },
        });
    }
    async findAll(userId, entity, action, page = 1, limit = 50) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (entity)
            where.entity = entity;
        if (action)
            where.action = action;
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: { user: { select: { id: true, name: true, email: true, globalRole: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findByUser(userId, page = 1, limit = 50) {
        return this.findAll(userId, undefined, undefined, page, limit);
    }
    async getStats() {
        const [total, byAction, byEntity, recentCount] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.groupBy({ by: ['action'], _count: true, orderBy: { _count: { action: 'desc' } } }),
            this.prisma.auditLog.groupBy({ by: ['entity'], _count: true, orderBy: { _count: { entity: 'desc' } } }),
            this.prisma.auditLog.count({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            }),
        ]);
        return {
            total,
            recentCount,
            byAction: byAction.map(a => ({ action: a.action, count: a._count })),
            byEntity: byEntity.map(e => ({ entity: e.entity, count: e._count })),
        };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map