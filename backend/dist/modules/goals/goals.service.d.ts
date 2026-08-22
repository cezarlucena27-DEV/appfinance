import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
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
    findOne(id: string, userId: string): Promise<{
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
    create(userId: string, dto: CreateGoalDto): Promise<{
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
    update(id: string, userId: string, dto: UpdateGoalDto): Promise<{
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
    addAmount(id: string, userId: string, amount: number): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
