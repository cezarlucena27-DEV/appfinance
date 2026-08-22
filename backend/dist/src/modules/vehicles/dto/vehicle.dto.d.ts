export declare class CreateVehicleDto {
    name: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    plate?: string;
    type?: string;
    fuelType?: string;
    kmCurrent?: number;
    kmInitial?: number;
    fuelPrice?: number;
    isDefault?: boolean;
}
export declare class UpdateVehicleDto {
    name?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    plate?: string;
    type?: string;
    fuelType?: string;
    kmCurrent?: number;
    kmInitial?: number;
    fuelPrice?: number;
    isDefault?: boolean;
}
export declare class CreateVehicleCostDto {
    description: string;
    amount: number;
    date: string;
    type: string;
}
