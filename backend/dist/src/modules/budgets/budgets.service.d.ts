import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            userId: string | null;
            icon: string;
            isDefault: boolean;
            color: string;
            type: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            userId: string | null;
            icon: string;
            isDefault: boolean;
            color: string;
            type: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    create(userId: string, dto: CreateBudgetDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            userId: string | null;
            icon: string;
            isDefault: boolean;
            color: string;
            type: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    update(id: string, userId: string, dto: UpdateBudgetDto): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            userId: string | null;
            icon: string;
            isDefault: boolean;
            color: string;
            type: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    }>;
    getProgress(userId: string): Promise<any[]>;
}
