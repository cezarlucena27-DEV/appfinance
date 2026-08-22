import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { DEFAULT_CATEGORIES } from '../../common/default-categories';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    await this.ensureDefaults(userId);
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  private async ensureDefaults(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { defaultsCreated: true },
    });
    if (user?.defaultsCreated) return;

    const existing = await this.prisma.category.findMany({
      where: { userId },
      select: { name: true, isDefault: true },
    });

    const hasDefaults = existing.some(c => c.isDefault);
    if (!hasDefaults) {
      const existingNames = new Set(existing.map(c => c.name));
      const missing = DEFAULT_CATEGORIES.filter(c => !existingNames.has(c.name));
      if (missing.length) {
        await this.prisma.category.createMany({
          data: missing.map(cat => ({ ...cat, userId })),
        });
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { defaultsCreated: true },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Categoria nao encontrada');
    }

    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const customCategoryCount = await this.prisma.category.count({
      where: { userId, isDefault: false },
    });

    if (customCategoryCount >= 20) {
      throw new ForbiddenException('Limite de categorias atingido para o plano Gratuito');
    }

    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        icon: dto.icon || 'tag',
        color: dto.color || '#64748B',
        type: dto.type,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id, userId);
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id, userId);

    await this.prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await this.prisma.budget.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
