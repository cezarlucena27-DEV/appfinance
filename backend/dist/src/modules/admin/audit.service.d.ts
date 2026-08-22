import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(userId: string, action: string, entity: string, entityId: string, oldValues?: any, newValues?: any, ip?: string, userAgent?: string): Promise<{
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
    }>;
    findAll(userId?: string, entity?: string, action?: string, page?: number, limit?: number): Promise<{
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
    findByUser(userId: string, page?: number, limit?: number): Promise<{
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
    getStats(): Promise<{
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
}
