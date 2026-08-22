import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
export declare class BudgetsController {
    private budgetsService;
    constructor(budgetsService: BudgetsService);
    findAll(req: any): Promise<({
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
    getProgress(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<{
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
    create(dto: CreateBudgetDto, req: any): Promise<{
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
    update(id: string, dto: UpdateBudgetDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        month: number;
        year: number;
        limitAmount: number;
    }>;
}
