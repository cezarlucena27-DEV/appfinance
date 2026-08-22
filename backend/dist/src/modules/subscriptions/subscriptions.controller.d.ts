import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getCurrent(req: any): Promise<{
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
    getPix(plan: string, req: any): Promise<{
        pixKey: string;
        amount: number;
        planName: string;
        payload: string;
    }>;
    getReminder(req: any): Promise<{
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
    checkout(plan: string, billingDay: number, req: any): Promise<{
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
    cancel(req: any): Promise<{
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
export declare class PublicInfoController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getPaymentInfo(): {
        pixKey: string;
        financeEmail: string;
    };
}
