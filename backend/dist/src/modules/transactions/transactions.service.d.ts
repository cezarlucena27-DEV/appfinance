import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, filters?: {
        startDate?: string;
        endDate?: string;
        type?: string;
    }): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
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
        card: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            accountId: string;
            brand: string;
            limit: number;
            closingDay: number;
            dueDay: number;
            lastDigits: string | null;
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
        card: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            accountId: string;
            brand: string;
            limit: number;
            closingDay: number;
            dueDay: number;
            lastDigits: string | null;
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
    }>;
    create(userId: string, dto: CreateTransactionDto): Promise<{
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
    }>;
    update(id: string, userId: string, dto: UpdateTransactionDto): Promise<{
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
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
    private validateAccountAccess;
    private updateAccountBalance;
    getMonthlyBalances(userId: string, startDate?: string, endDate?: string): Promise<{
        month: string;
        label: string;
        income: number;
        expenses: number;
        balance: number;
    }[]>;
    getMonthlySummary(userId: string): Promise<{
        income: number;
        expenses: number;
        balance: number;
    }>;
    private getVisibleAccountIds;
    getByCategory(userId: string): Promise<unknown[]>;
}
