import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, CreateVehicleCostDto } from './dto/vehicle.dto';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(req: any): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    create(dto: CreateVehicleDto, req: any): Promise<any>;
    update(id: string, dto: UpdateVehicleDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<any>;
    addCost(id: string, dto: CreateVehicleCostDto, req: any): Promise<any>;
    removeCost(costId: string, req: any): Promise<any>;
    getCostPerKm(id: string, req: any): Promise<{
        totalCosts: any;
        totalKm: number;
        costPerKm: number;
    }>;
}
