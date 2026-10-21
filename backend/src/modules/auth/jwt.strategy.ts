import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecret } from '../../common/security.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || payload.type !== 'access') {
      throw new UnauthorizedException('Sessao invalida. Entre novamente.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        globalRole: true,
        adminPanels: true,
        isAdminApproved: true,
        isActive: true,
        tokenVersion: true,
        subscription: { select: { blocked: true } },
        memberships: { select: { role: true, workspaceId: true }, take: 1 },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sessao invalida. Entre novamente.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Entre em contato com o administrador.');
    }
    if (user.globalRole === 'platform_admin' && !user.isAdminApproved) {
      throw new UnauthorizedException('Conta de administrador sem aprovacao.');
    }
    if ((payload.ver ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }

    if (user.subscription?.blocked && user.globalRole !== 'platform_admin') {
      throw new UnauthorizedException('Conta bloqueada por pendencia financeira. Entre em contato com o financeiro.');
    }

    const membership = user.memberships[0];

    return {
      id: user.id,
      email: user.email,
      globalRole: user.globalRole,
      adminPanels: user.adminPanels,
      isAdminApproved: user.isAdminApproved,
      role: membership?.role || 'member',
      workspaceId: membership?.workspaceId || '',
      isActive: user.isActive,
    };
  }
}
