import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from './audit.service';
import { OnlineTracker } from './online-tracker.service';
export declare const SUPER_ADMIN_EMAIL = "cezar.lucena27@gmail.com";
export declare const ADMIN_PANELS: string[];
export declare class AdminService {
    private prisma;
    private jwtService;
    private auditService;
    private onlineTracker;
    constructor(prisma: PrismaService, jwtService: JwtService, auditService: AuditService, onlineTracker: OnlineTracker);
    login(key: string): Promise<{
        accessToken: string;
    }>;
    verify(token: string): Promise<{
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
    getMonthlyReport(userId: string | undefined, month: number, year: number): Promise<{
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
    getAllTransactions(userId?: string, month?: number, year?: number): Promise<({
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
    getAllBudgets(userId?: string, month?: number, year?: number): Promise<({
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
    updateUserRole(userId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
    updateUser(userId: string, data: {
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
    createAdmin(data: {
        name: string;
        email: string;
    }, approverEmail: string): Promise<{
        id: string;
        name: string;
        email: string;
        tempPassword: string;
    }>;
    updateAdminPanels(userId: string, panels: string[], actorEmail: string): Promise<{
        id: string;
        name: string;
        email: string;
        adminPanels: string;
    }>;
    approveAdmin(userId: string, approverEmail: string): Promise<{
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
    toggleUserActive(userId: string, message?: string): Promise<{
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
    private getConfigPath;
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
    private resolvePaymentStatus;
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
    blockUserForPayment(userId: string, reason?: string, adminEmail?: string): Promise<{
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
    unblockUserForPayment(userId: string, accessUntil?: string, adminEmail?: string): Promise<{
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
    registerPayment(userId: string, data: {
        amount?: number;
        dueDate: string;
        notes?: string;
    }, adminEmail?: string): Promise<{
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
    getAsaasConfig(): Promise<{
        apiKey: string;
        webhookUrl: any;
        environment: any;
        pixKey: any;
    }>;
    updateAsaasConfig(data: {
        apiKey?: string;
        webhookUrl?: string;
        environment?: string;
        pixKey?: string;
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
    getAllTransactionsExport(userId?: string, month?: number, year?: number, type?: string): Promise<{
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
    exportExcel(userId?: string, month?: number, year?: number): Promise<Buffer<ArrayBufferLike>>;
}
