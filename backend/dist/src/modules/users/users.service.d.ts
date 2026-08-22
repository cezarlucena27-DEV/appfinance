import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllByWorkspace(workspaceId: string): Promise<{
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
    inviteUser(workspaceId: string, email: string, name: string, createdById?: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            globalRole: string;
        };
        tempPassword: string;
    }>;
    updateWorkspacePlan(workspaceId: string, plan: string): Promise<{
        id: string;
        name: string;
        plan: string;
    }>;
    toggleActive(id: string, workspaceId: string, message?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
    }>;
    updateRole(id: string, workspaceId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
    updateUser(id: string, workspaceId: string, data: {
        name?: string;
        email?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
        isActive: boolean;
    }>;
    resetPassword(id: string, workspaceId: string): Promise<{
        tempPassword: string;
        email: string;
    }>;
    deleteUser(id: string, workspaceId: string): Promise<{
        deleted: boolean;
    }>;
    getWorkspaceStats(workspaceId: string): Promise<{
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
}
