import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { Prisma } from '@prisma/client';
import { getPlanLimits } from '../../common/plan-limits';
import { parseDateOnly } from '../../common/date.util';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: { account: true },
    });

    if (!goal) {
      throw new NotFoundException('Meta nao encontrada');
    }

    return goal;
  }

  async create(userId: string, dto: CreateGoalDto) {
    const activeGoals = await this.prisma.goal.count({
      where: { userId, status: 'active' },
    });

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });
    const limits = getPlanLimits(membership?.workspace?.plan);

    if (activeGoals >= limits.goals) {
      throw new ForbiddenException('Limite de metas atingido para o seu plano');
    }

    if (dto.accountId) await this.assertOwnedAccount(userId, dto.accountId);

    return this.prisma.goal.create({
      data: {
        userId,
        name: dto.name.trim(),
        targetAmount: new Prisma.Decimal(dto.targetAmount),
        targetDate: parseDateOnly(dto.targetDate) as Date,
        accountId: dto.accountId,
        icon: dto.icon || 'target',
        color: dto.color || '#10B981',
      },
      include: { account: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.findOne(id, userId);
    if (dto.accountId) await this.assertOwnedAccount(userId, dto.accountId);

    const data: Prisma.GoalUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.targetAmount !== undefined) data.targetAmount = new Prisma.Decimal(dto.targetAmount);
    if (dto.currentAmount !== undefined) data.currentAmount = new Prisma.Decimal(dto.currentAmount);
    if (dto.targetDate !== undefined) data.targetDate = parseDateOnly(dto.targetDate) as Date;
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.accountId !== undefined) {
      data.account = dto.accountId ? { connect: { id: dto.accountId } } : { disconnect: true };
    }

    return this.prisma.goal.update({
      where: { id },
      data,
      include: { account: true },
    });
  }

  async addAmount(id: string, userId: string, amount: number) {
    const goal = await this.findOne(id, userId);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ForbiddenException('Valor invalido');
    }

    const current = new Prisma.Decimal(goal.currentAmount).plus(amount);
    const status = current.greaterThanOrEqualTo(goal.targetAmount) ? 'completed' : goal.status;

    return this.prisma.goal.update({
      where: { id },
      data: { currentAmount: current, status },
      include: { account: true },
    });
  }

  private async assertOwnedAccount(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new ForbiddenException('Conta nao pertence a este usuario');
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
