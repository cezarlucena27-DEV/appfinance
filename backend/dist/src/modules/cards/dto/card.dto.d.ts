export declare class CreateCardDto {
    name: string;
    brand?: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    accountId: string;
}
export declare class UpdateCardDto {
    name?: string;
    brand?: string;
    limit?: number;
    closingDay?: number;
    dueDay?: number;
    accountId?: string;
}
