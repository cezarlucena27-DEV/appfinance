import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import { AdminLoginDto } from './dto/admin.dto';
import { Response } from 'express';
export declare class AdminController {
    private adminService;
    private auditService;
    constructor(adminService: AdminService, auditService: AuditService);
    login(dto: AdminLoginDto): Promise<{
        accessToken: string;
    }>;
    verify(auth: string): Promise<{
        valid: boolean;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalWorkspaces: number;
        totalTransactions: number;
        plansBreakdown: {
            plan: string;
            count: number;
        }[];
        genderBreakdown: {
            gender: string;
            count: number;
        }[];
    }>;
    getOnlineUsers(): Promise<{
        onlineNow: number;
        totalActive: number;
        peakLast30Min: number;
        timeline: {
            label: string;
            count: number;
        }[];
        users: {
            id: any;
            name: any;
            email: any;
            globalRole: any;
            role: any;
            lastSeenAt: string;
            secondsAgo: number;
        }[];
    }>;
    getMonthlyBalances(userId?: string, startDate?: string, endDate?: string): Promise<{
        month: string;
        label: string;
        income: number;
        expenses: number;
        balance: number;
    }[]>;
    getUsers(): Promise<{
        role: string;
        workspaceId: string;
        workspace: {
            id: string;
            name: string;
            plan: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
        createdById: string;
        onboardingCompleted: boolean;
        lastLogin: Date;
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
        memberships: {
            role: string;
            workspace: {
                id: string;
                name: string;
                plan: string;
            };
        }[];
        _count: {
            accounts: number;
            transactions: number;
            cards: number;
            budgets: number;
            goals: number;
        };
    }[]>;
    getUserSummary(userId: string): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            globalRole: string;
        };
        totalTransactions: number;
        totalIncome: number;
        totalExpenses: number;
        balance: number;
        accounts: number;
        cards: number;
        budgets: number;
        goals: number;
    }>;
    getUserDetail(userId: string): Promise<{
        role: string;
        workspaceId: string;
        workspace: {
            id: string;
            name: string;
            plan: string;
        };
        totalIncome: number;
        totalExpenses: number;
        balance: number;
        recentTransactions: ({
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
        accounts: {
            id: string;
            name: string;
            color: string;
            type: string;
            currentBalance: number;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
        onboardingCompleted: boolean;
        gender: string;
        workDaysPerMonth: number;
        workHoursPerDay: number;
        weekendWork: string;
        updatedAt: Date;
        segment: {
            id: string;
            name: string;
        };
        memberships: {
            role: string;
            workspace: {
                id: string;
                name: string;
                plan: string;
            };
        }[];
        _count: {
            accounts: number;
            transactions: number;
            cards: number;
            budgets: number;
            goals: number;
        };
    }>;
    updateUser(userId: string, body: {
        name?: string;
        email?: string;
        globalRole?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
        isActive: boolean;
    }>;
    updateUserRole(userId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
    toggleUserActive(userId: string, body: {
        message?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
        isActive: boolean;
    }>;
    resetUserPassword(userId: string): Promise<{
        tempPassword: string;
        email: string;
    }>;
    deleteUser(userId: string): Promise<{
        deleted: boolean;
        email: string;
    }>;
    getPendingAdmins(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
        isAdminApproved: boolean;
        approvedBy: string;
        adminPanels: string;
    }[]>;
    getApprovedAdmins(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
        isAdminApproved: boolean;
        approvedBy: string;
        adminPanels: string;
    }[]>;
    createAdmin(body: {
        name: string;
        email: string;
    }, req: any): Promise<{
        id: string;
        name: string;
        email: string;
        tempPassword: string;
    }>;
    updateAdminPanels(userId: string, body: {
        panels: string[];
    }, req: any): Promise<{
        id: string;
        name: string;
        email: string;
        adminPanels: string;
    }>;
    approveAdmin(userId: string, req: any): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
        isAdminApproved: boolean;
    }>;
    rejectAdmin(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
    }>;
    revokeAdmin(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        globalRole: string;
        isAdminApproved: boolean;
    }>;
    getAuditLogs(userId?: string, entity?: string, action?: string, page?: string, limit?: string): Promise<{
        logs: ({
            user: {
                id: string;
                name: string;
                email: string;
                globalRole: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            action: string;
            entity: string;
            entityId: string;
            oldValues: string | null;
            newValues: string | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAuditStats(): Promise<{
        total: number;
        recentCount: number;
        byAction: {
            action: string;
            count: number;
        }[];
        byEntity: {
            entity: string;
            count: number;
        }[];
    }>;
    getMonthlyReport(userId?: string, month?: string, year?: string): Promise<{
        month: number;
        year: number;
        totalIncome: number;
        totalExpenses: number;
        balance: number;
        transactionCount: number;
        transactions: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            account: {
                id: string;
                name: string;
            };
            category: {
                id: string;
                name: string;
                color: string;
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
        incomeByCategory: {
            category: string;
            color: string;
            total: number;
            count: number;
        }[];
        expensesByCategory: {
            category: string;
            color: string;
            total: number;
            count: number;
        }[];
    }>;
    getAllTransactions(userId?: string, month?: string, year?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
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
    })[]>;
    getAllAccounts(userId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
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
    })[]>;
    getAllCards(userId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
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
    getAllBudgets(userId?: string, month?: string, year?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string | null;
        month: number;
        year: number;
        limitAmount: number;
    })[]>;
    getAllGoals(userId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        icon: string;
        color: string;
        accountId: string | null;
        targetAmount: number;
        currentAmount: number;
        targetDate: Date;
    })[]>;
    getAllCategories(userId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    })[]>;
    getAsaasConfig(): Promise<{
        apiKey: string;
        webhookUrl: any;
        environment: any;
        pixKey: any;
    }>;
    updateAsaasConfig(body: {
        apiKey?: string;
        webhookUrl?: string;
        environment?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getWorkspaces(): Promise<{
        id: string;
        name: string;
        plan: string;
        createdAt: Date;
        memberCount: number;
        members: {
            id: string;
            name: string;
            email: string;
            role: string;
            isActive: boolean;
        }[];
        subscription: {
            plan: string;
            status: string;
            value: number;
            nextDueDate: Date;
            billingType: string;
        };
    }[]>;
    getSubscriptionsFinance(): Promise<{
        id: string;
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            isActive: boolean;
        };
        planId: string;
        planName: string;
        value: number;
        status: string;
        billingDay: number;
        nextDueDate: Date;
        blocked: boolean;
        blockReason: string;
        accessUntil: Date;
        paymentStatus: string;
        payments: {
            id: string;
            createdAt: Date;
            userId: string;
            planId: string | null;
            status: string;
            amount: number;
            dueDate: Date;
            paidAt: Date | null;
            notes: string | null;
            registeredBy: string | null;
        }[];
    }[]>;
    getReminderViews(): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        daysUntilDue: number;
        viewedAt: Date;
    })[]>;
    blockUser(userId: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        workspaceId: string;
        planId: string | null;
        asaasId: string | null;
        billingType: string | null;
        billingDay: number | null;
        status: string;
        nextDueDate: Date | null;
        value: number;
        blocked: boolean;
        blockReason: string | null;
        accessUntil: Date | null;
    }>;
    unblockUser(userId: string, body: {
        accessUntil?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        workspaceId: string;
        planId: string | null;
        asaasId: string | null;
        billingType: string | null;
        billingDay: number | null;
        status: string;
        nextDueDate: Date | null;
        value: number;
        blocked: boolean;
        blockReason: string | null;
        accessUntil: Date | null;
    }>;
    registerPayment(userId: string, body: {
        amount?: number;
        dueDate: string;
        notes?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        planId: string | null;
        status: string;
        amount: number;
        dueDate: Date;
        paidAt: Date | null;
        notes: string | null;
        registeredBy: string | null;
    }>;
    getAllTransactionsExport(userId?: string, month?: string, year?: string, type?: string): Promise<{
        transactions: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
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
        summary: {
            total: number;
            totalIncome: number;
            totalExpenses: number;
            balance: number;
        };
    }>;
    exportExcel(res: Response, userId?: string, month?: string, year?: string): Promise<void>;
}
