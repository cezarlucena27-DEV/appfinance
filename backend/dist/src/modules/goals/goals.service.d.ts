import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
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
    findOne(id: string, userId: string): Promise<{
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
    create(userId: string, dto: CreateGoalDto): Promise<{
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
    update(id: string, userId: string, dto: UpdateGoalDto): Promise<{
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
    addAmount(id: string, userId: string, amount: number): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
