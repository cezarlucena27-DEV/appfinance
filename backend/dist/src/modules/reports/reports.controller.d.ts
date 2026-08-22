import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getMonthly(month: string, year: string, scope: string, req: any): Promise<{
        month: number;
        year: number;
        scope: string;
        totalIncome: number;
        totalExpenses: number;
        balance: number;
        transactionCount: number;
        transactions: ({
            user: {
                id: string;
                name: string;
            };
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
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: string;
            accountId: string;
            cardId: string | null;
            categoryId: string | null;
            amount: number;
            date: Date;
            isRecurring: boolean;
            recurrenceType: string | null;
            totalInstallments: number | null;
            currentInstallment: number | null;
            dueDate: Date | null;
            isPaid: boolean;
            paymentMethod: string | null;
            attachmentUrl: string | null;
        })[];
        byCategory: {
            category: string;
            color: string;
            total: number;
            count: number;
        }[];
    }>;
    getYearly(year: string, req: any): Promise<any[]>;
    exportCSV(month: string, year: string, scope: string, req: any, res: Response): Promise<void>;
    exportPDF(month: string, year: string, scope: string, req: any, res: Response): Promise<void>;
    exportExcel(month: string, year: string, scope: string, req: any, res: Response): Promise<void>;
}
