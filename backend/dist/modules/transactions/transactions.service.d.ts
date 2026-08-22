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
        card: {
            id: string;
            userId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            accountId: string;
            brand: string;
            limit: number;
            closingDay: number;
            dueDay: number;
        };
    } & {
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        accountId: string;
        cardId: string | null;
        amount: number;
        description: string | null;
        date: Date;
        isRecurring: boolean;
        recurrenceType: string | null;
        totalInstallments: number | null;
        currentInstallment: number | null;
        dueDate: Date | null;
        isPaid: boolean;
        attachmentUrl: string | null;
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
        card: {
            id: string;
            userId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            accountId: string;
            brand: string;
            limit: number;
            closingDay: number;
            dueDay: number;
        };
    } & {
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        accountId: string;
        cardId: string | null;
        amount: number;
        description: string | null;
        date: Date;
        isRecurring: boolean;
        recurrenceType: string | null;
        totalInstallments: number | null;
        currentInstallment: number | null;
        dueDate: Date | null;
        isPaid: boolean;
        attachmentUrl: string | null;
    }>;
    create(userId: string, dto: CreateTransactionDto): Promise<{
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
        type: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        accountId: string;
        cardId: string | null;
        amount: number;
        description: string | null;
        date: Date;
        isRecurring: boolean;
        recurrenceType: string | null;
        totalInstallments: number | null;
        currentInstallment: number | null;
        dueDate: Date | null;
        isPaid: boolean;
        attachmentUrl: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateTransactionDto): Promise<{
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
        type: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        accountId: string;
        cardId: string | null;
        amount: number;
        description: string | null;
        date: Date;
        isRecurring: boolean;
        recurrenceType: string | null;
        totalInstallments: number | null;
        currentInstallment: number | null;
        dueDate: Date | null;
        isPaid: boolean;
        attachmentUrl: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        accountId: string;
        cardId: string | null;
        amount: number;
        description: string | null;
        date: Date;
        isRecurring: boolean;
        recurrenceType: string | null;
        totalInstallments: number | null;
        currentInstallment: number | null;
        dueDate: Date | null;
        isPaid: boolean;
        attachmentUrl: string | null;
    }>;
    private updateAccountBalance;
    getMonthlySummary(userId: string): Promise<{
        income: number;
        expenses: number;
        balance: number;
    }>;
    getByCategory(userId: string): Promise<unknown[]>;
}
