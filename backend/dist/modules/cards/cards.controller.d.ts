import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
export declare class CardsController {
    private cardsService;
    constructor(cardsService: CardsService);
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    getBill(id: string, month: number, year: number, req: any): Promise<{
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
    create(dto: CreateCardDto, req: any): Promise<{
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
    update(id: string, dto: UpdateCardDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
