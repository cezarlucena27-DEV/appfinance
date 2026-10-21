import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { Prisma } from '@prisma/client';
import { getPlanLimits } from '../../common/plan-limits';
import { moneyNumber } from '../../common/money';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!budget) {
      throw new NotFoundException('Orcamento nao encontrado');
    }

    return budget;
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const budgetCount = await this.prisma.budget.count({
      where: { userId },
    });

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });
    const limits = getPlanLimits(membership?.workspace?.plan);

    if (budgetCount >= limits.budgets) {
      throw new ForbiddenException('Limite de orcamentos atingido para o seu plano');
    }

    await this.assertOwnedCategory(userId, dto.categoryId);

    const existing = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId: dto.categoryId,
        month: dto.month,
        year: dto.year,
      },
    });

    if (existing) {
      throw new ForbiddenException('Orcamento ja existe para esta categoria e mes');
    }

    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        month: dto.month,
        year: dto.year,
        limitAmount: new Prisma.Decimal(dto.limitAmount),
      },
      include: { category: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    await this.findOne(id, userId);
    if (dto.categoryId !== undefined) await this.assertOwnedCategory(userId, dto.categoryId);

    const data: Prisma.BudgetUpdateInput = {};
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId ? { connect: { id: dto.categoryId } } : { disconnect: true };
    }
    if (dto.month !== undefined) data.month = dto.month;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.limitAmount !== undefined) data.limitAmount = new Prisma.Decimal(dto.limitAmount);

    return this.prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  private async assertOwnedCategory(userId: string, categoryId?: string) {
    if (!categoryId) return;
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw new ForbiddenException('Categoria nao pertence a este usuario');
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.budget.delete({
      where: { id },
    });
  }

  async getProgress(userId: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    });

    const results = [];

    for (const budget of budgets) {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'expense',
          date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59, 999),
          },
        },
      });

      const spent = transactions.reduce((sum, t) => sum + moneyNumber(t.amount), 0);
      const limit = moneyNumber(budget.limitAmount);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      results.push({
        ...budget,
        spent,
        percentage,
        isOverBudget: percentage > 100,
        isWarning: percentage >= 80 && percentage <= 100,
      });
    }

    return results;
  }
}
