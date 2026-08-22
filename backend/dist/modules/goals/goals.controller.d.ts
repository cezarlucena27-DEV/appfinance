import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
export declare class GoalsController {
    private goalsService;
    constructor(goalsService: GoalsService);
    findAll(req: any): Promise<({
        account: {
            id: string;
            userId: string;
            name: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            icon: string;
            color: string;
            isPrimary: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        name: string;
        icon: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        accountId: string | null;
        targetAmount: number;
        targetDate: Date;
        status: string;
        currentAmount: number;
    })[]>;
    findOne(id: string, req: any): Promise<{
        account: {
            id: string;
            userId: string;
            name: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            icon: string;
            color: string;
            isPrimary: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        name: string;
        icon: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        accountId: string | null;
        targetAmount: number;
        targetDate: Date;
        status: string;
        currentAmount: number;
    }>;
    create(dto: CreateGoalDto, req: any): Promise<{
        account: {
            id: string;
            userId: string;
            name: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            icon: string;
            color: string;
            isPrimary: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        name: string;
        icon: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        accountId: string | null;
        targetAmount: number;
        targetDate: Date;
        status: string;
        currentAmount: number;
    }>;
    update(id: string, dto: UpdateGoalDto, req: any): Promise<{
        account: {
            id: string;
            userId: string;
            name: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            icon: string;
            color: string;
            isPrimary: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        name: string;
        icon: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        accountId: string | null;
        targetAmount: number;
        targetDate: Date;
        status: string;
        currentAmount: number;
    }>;
    addAmount(id: string, amount: number, req: any): Promise<{
        account: {
            id: string;
            userId: string;
            name: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            icon: string;
            color: string;
            isPrimary: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        name: string;
        icon: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        accountId: string | null;
        targetAmount: number;
        targetDate: Date;
        status: string;
        currentAmount: number;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        userId: string;
        name: string;
        icon: string;
        color: string;
        createdAt: Date;
        updatedAt: Date;
        accountId: string | null;
        targetAmount: number;
        targetDate: Date;
        status: string;
        currentAmount: number;
    }>;
}
