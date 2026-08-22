import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
export declare class AccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<any[]>;
    getWorkspaceAccounts(masterUserId: string): Promise<{
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
    getAccountTransactions(masterUserId: string, accountId: string): Promise<{
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
    exportWorkspaceExcel(masterUserId: string): Promise<Buffer<ArrayBufferLike>>;
    findOne(id: string, userId: string): Promise<{
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
    create(userId: string, dto: CreateAccountDto): Promise<{
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
    update(id: string, userId: string, dto: UpdateAccountDto): Promise<{
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
    linkAccount(id: string, ownerUserId: string, targetUserId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        accountId: string;
    }>;
    unlinkAccount(id: string, ownerUserId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    remove(id: string, userId: string): Promise<{
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
    getBalance(userId: string): Promise<number>;
}
