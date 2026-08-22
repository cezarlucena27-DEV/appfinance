import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    });

    return { onboardingCompleted: user?.onboardingCompleted || false };
  }

  async complete(userId: string, dto: CompleteOnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        segmentId: dto.segmentId,
        gender: dto.gender,
        workDaysPerMonth: dto.workDaysPerMonth,
        workHoursPerDay: dto.workHoursPerDay,
        weekendWork: dto.weekendWork,
        onboardingCompleted: true,
      },
    });
  }
}
