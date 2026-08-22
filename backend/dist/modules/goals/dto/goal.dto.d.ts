export declare class CreateGoalDto {
    name: string;
    targetAmount: number;
    targetDate: string;
    accountId?: string;
    icon?: string;
    color?: string;
}
export declare class UpdateGoalDto {
    name?: string;
    targetAmount?: number;
    targetDate?: string;
    status?: string;
}
