import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
export declare class CardsController {
    private cardsService;
    constructor(cardsService: CardsService);
    findAll(req: any): Promise<({
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
    } & {
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
    })[]>;
    findOne(id: string, req: any): Promise<{
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
    } & {
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
    }>;
    getBill(id: string, month: number, year: number, req: any): Promise<{
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
        month: number;
        year: number;
        transactions: ({
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
        total: number;
        availableLimit: number;
    }>;
    create(dto: CreateCardDto, req: any): Promise<{
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
    } & {
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
    }>;
    update(id: string, dto: UpdateCardDto, req: any): Promise<{
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
    } & {
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
    }>;
    remove(id: string, req: any): Promise<{
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
    }>;
}
