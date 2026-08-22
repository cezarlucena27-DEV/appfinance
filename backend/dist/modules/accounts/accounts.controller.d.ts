import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
export declare class AccountsController {
    private accountsService;
    constructor(accountsService: AccountsService);
    findAll(req: any): Promise<{
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
    getBalance(req: any): Promise<number>;
    findOne(id: string, req: any): Promise<{
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
    create(dto: CreateAccountDto, req: any): Promise<{
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
    update(id: string, dto: UpdateAccountDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
