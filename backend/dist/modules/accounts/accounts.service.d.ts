import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
export declare class AccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
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
    }[]>;
    findOne(id: string, userId: string): Promise<{
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
    }>;
    create(userId: string, dto: CreateAccountDto): Promise<{
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
    }>;
    update(id: string, userId: string, dto: UpdateAccountDto): Promise<{
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
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
    getBalance(userId: string): Promise<number>;
}
