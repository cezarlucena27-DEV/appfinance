import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }[]>;
    private ensureDefaults;
    findOne(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
    create(userId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
    update(id: string, userId: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
}
