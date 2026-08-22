import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
    create(dto: CreateCategoryDto, req: any): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
    update(id: string, dto: UpdateCategoryDto, req: any): Promise<{
        id: string;
        userId: string | null;
        name: string;
        type: string;
        icon: string;
        color: string;
        createdAt: Date;
        isDefault: boolean;
    }>;
    remove(id: string, req: any): Promise<{
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
