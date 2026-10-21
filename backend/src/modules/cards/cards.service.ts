import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { getPlanLimits } from '../../common/plan-limits';
import { Prisma } from '@prisma/client';
import { moneyNumber } from '../../common/money';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id, userId },
      include: { account: true },
    });

    if (!card) {
      throw new NotFoundException('Cartao nao encontrado');
    }

    return card;
  }

  async create(userId: string, dto: CreateCardDto) {
    const cardCount = await this.prisma.card.count({
      where: { userId },
    });

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });
    const limits = getPlanLimits(membership?.workspace?.plan);

    if (cardCount >= limits.cards) {
      throw new ForbiddenException('Limite de cartoes atingido para o seu plano');
    }

    await this.assertOwnedAccount(userId, dto.accountId);

    return this.prisma.card.create({
      data: {
        userId,
        name: dto.name.trim(),
        brand: dto.brand || 'other',
        limit: new Prisma.Decimal(dto.limit),
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        accountId: dto.accountId,
      },
      include: { account: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateCardDto) {
    await this.findOne(id, userId);
    if (dto.accountId) await this.assertOwnedAccount(userId, dto.accountId);

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.brand !== undefined) data.brand = dto.brand;
    if (dto.limit !== undefined) data.limit = new Prisma.Decimal(dto.limit);
    if (dto.closingDay !== undefined) data.closingDay = dto.closingDay;
    if (dto.dueDay !== undefined) data.dueDay = dto.dueDay;
    if (dto.accountId !== undefined) data.accountId = dto.accountId;

    return this.prisma.card.update({
      where: { id },
      data,
      include: { account: true },
    });
  }

  private async assertOwnedAccount(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new ForbiddenException('Conta nao pertence a este usuario');
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const transactionCount = await this.prisma.transaction.count({
      where: { cardId: id },
    });

    if (transactionCount > 0) {
      throw new ForbiddenException('Nao e possivel excluir cartao com transacoes');
    }

    return this.prisma.card.delete({
      where: { id },
    });
  }

  async getBill(cardId: string, userId: string, month: number, year: number) {
    await this.findOne(cardId, userId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        cardId,
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const total = transactions.reduce((sum, t) => sum + moneyNumber(t.amount), 0);
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Cartao nao encontrado');

    return {
      card,
      month,
      year,
      transactions,
      total,
      availableLimit: moneyNumber(card.limit) - total,
    };
  }
}
