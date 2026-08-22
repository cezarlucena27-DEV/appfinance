import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsController {
    private budgetsService;
    constructor(budgetsService: BudgetsService);
    findAll(req: any): Promise<({
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
    getProgress(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<{
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
    create(dto: CreateBudgetDto, req: any): Promise<{
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
    update(id: string, dto: UpdateBudgetDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    }>;
}
