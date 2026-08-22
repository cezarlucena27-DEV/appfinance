import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto, CreateVehicleCostDto } from './dto/vehicle.dto';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any>;
    findOne(id: string, userId: string): Promise<any>;
    create(userId: string, dto: CreateVehicleDto): Promise<any>;
    update(id: string, userId: string, dto: UpdateVehicleDto): Promise<any>;
    remove(id: string, userId: string): Promise<any>;
    addCost(vehicleId: string, userId: string, dto: CreateVehicleCostDto): Promise<any>;
    removeCost(costId: string, userId: string): Promise<any>;
    getCostPerKm(vehicleId: string, userId: string): Promise<{
        totalCosts: any;
        totalKm: number;
        costPerKm: number;
    }>;
}
