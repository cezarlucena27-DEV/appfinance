import { PrismaService } from '../../prisma/prisma.service';
export declare class SegmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        icon: string;
    }[]>;
}
