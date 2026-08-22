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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let VehiclesService = class VehiclesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.vehicle.findMany({
            where: { userId },
            include: { costs: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id, userId },
            include: { costs: true },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        return vehicle;
    }
    async create(userId, dto) {
        return this.prisma.vehicle.create({
            data: {
                userId,
                name: dto.name,
                brand: dto.brand,
                model: dto.model,
                year: dto.year,
                color: dto.color,
                plate: dto.plate,
                type: dto.type,
                fuelType: dto.fuelType,
                kmCurrent: dto.kmCurrent,
                kmInitial: dto.kmInitial,
                fuelPrice: dto.fuelPrice,
                isDefault: dto.isDefault || false,
            },
        });
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        return this.prisma.vehicle.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
    async addCost(vehicleId, userId, dto) {
        await this.findOne(vehicleId, userId);
        return this.prisma.vehicleCost.create({
            data: {
                vehicleId,
                description: dto.description,
                amount: dto.amount,
                date: new Date(dto.date),
                type: dto.type,
            },
        });
    }
    async removeCost(costId, userId) {
        const cost = await this.prisma.vehicleCost.findUnique({
            where: { id: costId },
            include: { vehicle: true },
        });
        if (!cost || cost.vehicle.userId !== userId) {
            throw new common_1.NotFoundException('Cost not found');
        }
        return this.prisma.vehicleCost.delete({
            where: { id: costId },
        });
    }
    async getCostPerKm(vehicleId, userId) {
        const vehicle = await this.findOne(vehicleId, userId);
        const costs = await this.prisma.vehicleCost.findMany({
            where: { vehicleId },
        });
        const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
        const totalKm = (vehicle.kmCurrent || 0) - (vehicle.kmInitial || 0);
        const costPerKm = totalKm > 0 ? totalCosts / totalKm : 0;
        return {
            totalCosts,
            totalKm,
            costPerKm,
        };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map