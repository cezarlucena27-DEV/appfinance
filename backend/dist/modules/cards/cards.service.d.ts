import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
export declare class CardsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
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
    } & {
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
    } & {
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
    }>;
    create(userId: string, dto: CreateCardDto): Promise<{
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
    } & {
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
    }>;
    update(id: string, userId: string, dto: UpdateCardDto): Promise<{
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
    } & {
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
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
    getBill(cardId: string, userId: string, month: number, year: number): Promise<{
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
        month: number;
        year: number;
        transactions: ({
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
        })[];
        total: number;
        availableLimit: number;
    }>;
}
