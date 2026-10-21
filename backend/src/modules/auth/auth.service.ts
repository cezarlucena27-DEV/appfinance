import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { DEFAULT_CATEGORIES } from '../../common/default-categories';
import { getJwtRefreshSecret, getSuperAdminEmail } from '../../common/security.config';

const FORGOT_PASSWORD_MESSAGE =
  'Se o e-mail estiver cadastrado, o administrador do workspace foi notificado. Nenhuma senha e exibida por este canal.';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email ja cadastrado no sistema');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        globalRole: 'regular',
        isAdminApproved: false,
        defaultsCreated: true,
      },
    });

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.workspaceName?.trim() || `${dto.name.trim()}'s Workspace`,
        ownerId: user.id,
        plan: 'free',
      },
    });

    const membership = await this.prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'master',
      },
    });

    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: user.id })),
    });

    const tokens = this.generateTokens(user, workspace.id, membership.role);
    return {
      user: this.publicUser(user, workspace, 'master'),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Entre em contato com o administrador.');
    }

    if (user.globalRole === 'platform_admin' && !user.isAdminApproved) {
      throw new UnauthorizedException('Conta de administrador aguardando aprovacao.');
    }

    const blockSubscription = await this.prisma.subscription.findUnique({ where: { userId: user.id } });
    if (blockSubscription?.blocked) {
      throw new UnauthorizedException('Conta bloqueada por pendencia financeira. Entre em contato com o financeiro.');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
    });

    const workspaceId = membership?.workspaceId || '';
    const role = membership?.role || 'member';
    const tokens = this.generateTokens(user, workspaceId, role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), lastSeenAt: new Date() },
    });

    return {
      user: {
        ...this.publicUser(user, membership?.workspace, role),
        subscriptionBlocked: blockSubscription?.blocked || false,
        blockReason: blockSubscription?.blockReason || null,
        accessUntil: blockSubscription?.accessUntil || null,
        nextDueDate: blockSubscription?.nextDueDate || null,
      },
      ...tokens,
    };
  }

  async heartbeat(userId: string) {
    try {
      await this.prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
    } catch {}
    return { ok: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
        adminPanels: true,
        isAdminApproved: true,
        approvedBy: true,
        onboardingCompleted: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: { select: { id: true, name: true, plan: true } } },
    });

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { blocked: true, blockReason: true, accessUntil: true, nextDueDate: true, planId: true },
    });

    return {
      ...user,
      isSuperAdmin: !!getSuperAdminEmail() && user.email.toLowerCase() === getSuperAdminEmail(),
      workspaceId: membership?.workspaceId || '',
      role: membership?.role || 'member',
      workspace: membership?.workspace || undefined,
      subscriptionBlocked: subscription?.blocked || false,
      blockReason: subscription?.blockReason || null,
      accessUntil: subscription?.accessUntil || null,
      nextDueDate: subscription?.nextDueDate || null,
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: getJwtRefreshSecret() });
    } catch {
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }

    if (!payload?.sub || payload.type !== 'refresh') {
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || (payload.ver ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }
    if (user.globalRole === 'platform_admin' && !user.isAdminApproved) {
      throw new UnauthorizedException('Conta de administrador sem aprovacao.');
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { userId: user.id } });
    if (subscription?.blocked) {
      throw new UnauthorizedException('Conta bloqueada por pendencia financeira. Entre em contato com o financeiro.');
    }

    // Rotaciona o refresh token: o token apresentado deixa de ser valido para
    // uso unico, limitando a janela de reuso de um token roubado.
    const rotated = await this.prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId: user.id },
    });

    return this.generateTokens(rotated, membership?.workspaceId || '', membership?.role || 'member');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario nao encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Senha atual incorreta');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });

    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId } });
    const tokens = this.generateTokens(updated, membership?.workspaceId || '', membership?.role || 'member');

    return { message: 'Senha alterada com sucesso', ...tokens };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    return { message: 'Sessao encerrada' };
  }

  async forgotPassword(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });

    if (user && user.isActive) {
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          entity: 'auth',
          entityId: user.id,
        },
      }).catch(() => undefined);
    }

    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  private publicUser(user: any, workspace: any, role: string) {
    const { passwordHash, tokenVersion, ...safeUser } = user;
    return {
      ...safeUser,
      isSuperAdmin: !!getSuperAdminEmail() && String(user.email).toLowerCase() === getSuperAdminEmail(),
      role,
      workspaceId: workspace?.id || '',
      workspace: workspace
        ? { id: workspace.id, name: workspace.name, plan: workspace.plan }
        : undefined,
    };
  }

  private generateTokens(user: any, workspaceId: string, role: string) {
    const basePayload = {
      sub: user.id,
      email: user.email,
      globalRole: user.globalRole,
      workspaceId,
      role,
      ver: user.tokenVersion,
    };

    const accessToken = this.jwtService.sign({ ...basePayload, type: 'access' });
    const refreshToken = this.jwtService.sign(
      { ...basePayload, type: 'refresh' },
      { secret: getJwtRefreshSecret(), expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
