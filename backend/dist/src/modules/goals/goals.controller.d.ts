import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
export declare class GoalsController {
    private goalsService;
    constructor(goalsService: GoalsService);
    findAll(req: any): Promise<({
        account: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            icon: string;
            color: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            isPrimary: boolean;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    })[]>;
    findOne(id: string, req: any): Promise<{
        account: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            icon: string;
            color: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            isPrimary: boolean;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    }>;
    create(dto: CreateGoalDto, req: any): Promise<{
        account: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            icon: string;
            color: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            isPrimary: boolean;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    }>;
    update(id: string, dto: UpdateGoalDto, req: any): Promise<{
        account: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            icon: string;
            color: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            isPrimary: boolean;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    }>;
    addAmount(id: string, amount: number, req: any): Promise<{
        account: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            icon: string;
            color: string;
            type: string;
            initialBalance: number;
            currentBalance: number;
            isPrimary: boolean;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    }>;
}
