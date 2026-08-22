import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

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

    const limits = { free: 1, premium: 5, pro: 999999 };
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });
    const plan = (membership?.workspace?.plan || 'free') as keyof typeof limits;
    
    if (activeGoals >= limits[plan]) {
      throw new ForbiddenException('Limite de metas atingido para o seu plano');
    }

    return this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        targetDate: new Date(dto.targetDate),
        accountId: dto.accountId,
        icon: dto.icon || 'target',
        color: dto.color || '#10B981',
      },
      include: { account: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.findOne(id, userId);
    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
      include: { account: true },
    });
  }

  async addAmount(id: string, userId: string, amount: number) {
    const goal = await this.findOne(id, userId);

    const newAmount = goal.currentAmount + amount;
    const status = newAmount >= goal.targetAmount ? 'completed' : goal.status;

    return this.prisma.goal.update({
      where: { id },
      data: { currentAmount: newAmount, status },
      include: { account: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
