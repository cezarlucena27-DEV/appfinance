import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
        category: {
            id: string;
            userId: string | null;
            name: string;
            type: string;
            icon: string;
            color: string;
            createdAt: Date;
            isDefault: boolean;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        month: number;
        year: number;
        limitAmount: number;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        category: {
            id: string;
            userId: string | null;
            name: string;
            type: string;
            icon: string;
            color: string;
            createdAt: Date;
            isDefault: boolean;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    create(userId: string, dto: CreateBudgetDto): Promise<{
        category: {
            id: string;
            userId: string | null;
            name: string;
            type: string;
            icon: string;
            color: string;
            createdAt: Date;
            isDefault: boolean;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    update(id: string, userId: string, dto: UpdateBudgetDto): Promise<{
        category: {
            id: string;
            userId: string | null;
            name: string;
            type: string;
            icon: string;
            color: string;
            createdAt: Date;
            isDefault: boolean;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    getProgress(userId: string): Promise<any[]>;
}
