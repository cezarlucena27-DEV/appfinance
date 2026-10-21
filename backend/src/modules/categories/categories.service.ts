import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { DEFAULT_CATEGORIES } from '../../common/default-categories';
import { getPlanLimits } from '../../common/plan-limits';

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
    const [customCategoryCount, membership] = await Promise.all([
      this.prisma.category.count({ where: { userId, isDefault: false } }),
      this.prisma.workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
      }),
    ]);

    const limits = getPlanLimits(membership?.workspace?.plan);
    if (customCategoryCount >= limits.categories) {
      throw new ForbiddenException('Limite de categorias atingido para o seu plano');
    }

    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name.trim(),
        icon: dto.icon || 'tag',
        color: dto.color || '#64748B',
        type: dto.type,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    await this.findOne(id, userId);

    const data: Partial<UpdateCategoryDto> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.transaction.updateMany({
      where: { categoryId: id, userId },
      data: { categoryId: null },
    });

    await this.prisma.budget.updateMany({
      where: { categoryId: id, userId },
      data: { categoryId: null },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
