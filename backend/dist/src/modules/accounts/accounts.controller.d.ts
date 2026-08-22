import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { Response } from 'express';
export declare class AccountsController {
    private accountsService;
    constructor(accountsService: AccountsService);
    findAll(req: any): Promise<any[]>;
    getBalance(req: any): Promise<number>;
    getWorkspaceAccounts(req: any): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
        };
        transactionCount: number;
        linkedToMaster: boolean;
        sharedWith: {
            id: string;
            name: string;
            email: string;
        }[];
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
    }[]>;
    getAccountTransactions(accountId: string, req: any): Promise<{
        account: {
            id: string;
            name: string;
            type: string;
            currentBalance: number;
            owner: {
                id: string;
                name: string;
                email: string;
            };
        };
        transactions: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
    }>;
    exportWorkspaceExcel(req: any, res: Response): Promise<void>;
    findOne(id: string, req: any): Promise<{
        shares: {
            id: string;
            createdAt: Date;
            userId: string;
            accountId: string;
        }[];
    } & {
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
    }>;
    create(dto: CreateAccountDto, req: any): Promise<{
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
    }>;
    update(id: string, dto: UpdateAccountDto, req: any): Promise<{
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
    }>;
    linkAccount(id: string, body: {
        userId: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        accountId: string;
    }>;
    unlinkAccount(id: string, userId: string, req: any): Promise<{
        message: string;
    }>;
    remove(id: string, req: any): Promise<{
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
    }>;
}
