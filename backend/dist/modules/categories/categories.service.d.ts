import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
    create(userId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
    update(id: string, userId: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
}
