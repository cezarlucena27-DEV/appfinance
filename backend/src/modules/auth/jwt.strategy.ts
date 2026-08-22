import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'financeapp-secret-key-2026',
    });
  }

async validate(payload: any) {
    const user = payload.sub
      ? await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, globalRole: true, adminPanels: true, isActive: true, deactivatedMessage: true },
        })
      : null;

    if (user && !user.isActive) {
      throw new UnauthorizedException(
        user.deactivatedMessage
          ? `Sua conta foi desativada. Motivo: ${user.deactivatedMessage}`
          : 'Sua conta foi desativada. Entre em contato com o administrador.'
      );
    }

    return {
      id: payload.sub,
      email: user?.email || payload.email,
      globalRole: user?.globalRole || payload.globalRole,
      adminPanels: user?.adminPanels || 'all',
      role: payload.role,
      workspaceId: payload.workspaceId,
      isActive: user?.isActive ?? true,
    };
  }
}
