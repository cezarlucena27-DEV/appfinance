import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(user: any): Promise<{
        role: string;
        totalSpending: number;
        totalIncome: number;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
        createdById: string;
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            accounts: number;
            transactions: number;
            cards: number;
        };
    }[]>;
    getStats(user: any): Promise<{
        workspace: {
            name: string;
            createdAt: Date;
            plan: string;
        };
        totalUsers: number;
        activeUsers: number;
        totalTransactions: number;
        totalAccounts: number;
    }>;
    toggleActive(id: string, body: {
        message?: string;
    }, user: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
    }>;
    updateRole(id: string, role: string, user: any): Promise<{
        id: string;
        role: string;
    }>;
    updateUser(id: string, body: {
        name?: string;
        email?: string;
    }, user: any): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
        isActive: boolean;
    }>;
    resetPassword(id: string, user: any): Promise<{
        tempPassword: string;
        email: string;
    }>;
    deleteUser(id: string, user: any): Promise<{
        deleted: boolean;
    }>;
    inviteUser(body: {
        email: string;
        name: string;
    }, user: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            globalRole: string;
        };
        tempPassword: string;
    }>;
    updatePlan(plan: string, user: any): Promise<{
        id: string;
        name: string;
        plan: string;
    }>;
}
