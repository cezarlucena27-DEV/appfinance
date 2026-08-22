import { PrismaService } from '../../prisma/prisma.service';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getPixConfigPath;
    private getPixKey;
    getPublicPaymentInfo(): {
        pixKey: string;
        financeEmail: string;
    };
    private emvField;
    private crc16;
    private buildPixPayload;
    getPix(userId: string, planId: string): Promise<{
        pixKey: string;
        amount: number;
        planName: string;
        payload: string;
    }>;
    private computeNextDueDate;
    getCurrent(userId: string): Promise<{
        id: string;
        planId: string;
        plan: {
            id: string;
            name: string;
            price: number;
        };
        status: string;
        value: number;
        billingDay: number;
        nextDueDate: Date;
        createdAt: Date;
    }>;
    getPlans(): Promise<{
        id: string;
        name: string;
        price: number;
        features: string[];
    }[]>;
    checkout(userId: string, plan: string, billingDay?: number): Promise<{
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
    getReminder(userId: string): Promise<{
        show: boolean;
        daysUntilDue?: undefined;
        dueDate?: undefined;
        planName?: undefined;
        value?: undefined;
    } | {
        show: boolean;
        daysUntilDue: number;
        dueDate: Date;
        planName: string;
        value: number;
    }>;
    cancel(userId: string): Promise<{
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
}
