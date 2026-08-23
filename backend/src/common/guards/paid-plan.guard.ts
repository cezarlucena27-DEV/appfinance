import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Libera apenas planos pagos (Premium/PRO) - usado em recursos marcados como Premium+ no manual
@Injectable()
export class PaidPlanGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: { select: { plan: true } } },
    });
    const plan = membership?.workspace?.plan || 'free';
    if (plan === 'free') {
      throw new ForbiddenException('Disponivel nos planos Premium ou PRO. Faca upgrade para acessar.');
    }
    return true;
  }
}
