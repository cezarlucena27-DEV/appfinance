import { PrismaService } from '../../prisma/prisma.service';
export declare class PartnersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        owned: ({
            partner: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            ownerId: string;
            status: string;
            permission: string;
            partnerId: string;
        })[];
        of: ({
            owner: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            ownerId: string;
            status: string;
            permission: string;
            partnerId: string;
        })[];
    }>;
    create(userId: string, dto: {
        email: string;
        permission?: string;
    }): Promise<{
        partner: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ownerId: string;
        status: string;
        permission: string;
        partnerId: string;
    }>;
    update(id: string, userId: string, dto: {
        permission?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        ownerId: string;
        status: string;
        permission: string;
        partnerId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        ownerId: string;
        status: string;
        permission: string;
        partnerId: string;
    }>;
}
