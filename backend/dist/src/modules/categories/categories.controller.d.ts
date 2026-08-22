import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
    create(dto: CreateCategoryDto, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
    update(id: string, dto: UpdateCategoryDto, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        userId: string | null;
        icon: string;
        isDefault: boolean;
        color: string;
        type: string;
    }>;
    remove(id: string, req: any): Promise<{
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
