import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';

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

    const limits = { free: 2, premium: 5, pro: 999999 };
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });
    const plan = (membership?.workspace?.plan || 'free') as keyof typeof limits;
    
    if (cardCount >= limits[plan]) {
      throw new ForbiddenException('Limite de cartoes atingido para o seu plano');
    }

    return this.prisma.card.create({
      data: {
        userId,
        name: dto.name,
        brand: dto.brand || 'other',
        limit: dto.limit,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        accountId: dto.accountId,
      },
      include: { account: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateCardDto) {
    await this.findOne(id, userId);
    return this.prisma.card.update({
      where: { id },
      data: dto,
      include: { account: true },
    });
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
    const endDate = new Date(year, month, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        cardId,
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });

    return {
      card,
      month,
      year,
      transactions,
      total,
      availableLimit: card.limit - total,
    };
  }
}
