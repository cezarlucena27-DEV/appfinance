import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { DEFAULT_CATEGORIES } from '../../common/default-categories';
import { getJwtRefreshSecret, isSuperAdmin } from '../../common/security.config';

const REFRESH_TTL = '7d';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Janela em que o jti anterior ainda e aceito (abas concorrentes com o mesmo cookie).
const REFRESH_REUSE_GRACE_MS = 30_000;
const refreshExpiry = () => new Date(Date.now() + REFRESH_TTL_MS);

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

    const tokens = await this.generateTokens(user, workspace.id, membership.role);
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
    if (blockSubscription?.blocked && user.globalRole !== 'platform_admin') {
      throw new UnauthorizedException('Conta bloqueada por pendencia financeira. Entre em contato com o financeiro.');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
    });

    const workspaceId = membership?.workspaceId || '';
    const role = membership?.role || 'member';
    const tokens = await this.generateTokens(user, workspaceId, role);

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
      isSuperAdmin: isSuperAdmin(user.email),
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
    if (subscription?.blocked && user.globalRole !== 'platform_admin') {
      throw new UnauthorizedException('Conta bloqueada por pendencia financeira. Entre em contato com o financeiro.');
    }

    // Rotacao por sessao: cada refresh token so vale uma vez, sem afetar as
    // outras sessoes (abas/dispositivos) do usuario.
    const session = payload.sid
      ? await this.prisma.refreshSession.findUnique({ where: { id: payload.sid } })
      : null;
    if (!session || session.userId !== user.id || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId: user.id },
    });
    const workspaceId = membership?.workspaceId || '';
    const role = membership?.role || 'member';

    if (payload.jti !== session.currentJti) {
      // Duas abas podem enviar o mesmo cookie ao mesmo tempo: o jti anterior
      // ainda vale por alguns segundos e recebe o token atual, sem nova rotacao.
      const withinGrace = payload.jti === session.previousJti
        && session.rotatedAt
        && Date.now() - session.rotatedAt.getTime() < REFRESH_REUSE_GRACE_MS;
      if (withinGrace) {
        return this.signTokens(user, workspaceId, role, session.id, session.currentJti);
      }
      // Reuso de token antigo: provavel roubo. Revoga a sessao inteira.
      await this.prisma.refreshSession.deleteMany({ where: { id: session.id } });
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }

    const nextJti = randomUUID();
    const rotated = await this.prisma.refreshSession.updateMany({
      where: { id: session.id, currentJti: session.currentJti },
      data: { currentJti: nextJti, previousJti: session.currentJti, rotatedAt: new Date(), expiresAt: refreshExpiry() },
    });
    if (rotated.count === 0) {
      // Outra requisicao concorrente rotacionou primeiro: devolve o token atual.
      const latest = await this.prisma.refreshSession.findUnique({ where: { id: session.id } });
      if (!latest || latest.previousJti !== payload.jti) {
        throw new UnauthorizedException('Sessao expirada. Entre novamente.');
      }
      return this.signTokens(user, workspaceId, role, latest.id, latest.currentJti);
    }

    return this.signTokens(user, workspaceId, role, session.id, nextJti);
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

    // Senha nova: encerra todas as sessoes antigas e abre uma para este dispositivo.
    await this.prisma.refreshSession.deleteMany({ where: { userId } });
    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId } });
    const tokens = await this.generateTokens(updated, membership?.workspaceId || '', membership?.role || 'member');

    return { message: 'Senha alterada com sucesso', ...tokens };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
    await this.prisma.refreshSession.deleteMany({ where: { userId } });
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
      isSuperAdmin: isSuperAdmin(user.email),
      role,
      workspaceId: workspace?.id || '',
      workspace: workspace
        ? { id: workspace.id, name: workspace.name, plan: workspace.plan }
        : undefined,
    };
  }

  // Abre uma nova sessao de refresh (login, cadastro, troca de senha).
  private async generateTokens(user: any, workspaceId: string, role: string) {
    // Limpeza oportunista das sessoes vencidas do usuario.
    await this.prisma.refreshSession.deleteMany({ where: { userId: user.id, expiresAt: { lte: new Date() } } });
    const jti = randomUUID();
    const session = await this.prisma.refreshSession.create({
      data: { userId: user.id, currentJti: jti, expiresAt: refreshExpiry() },
    });
    return this.signTokens(user, workspaceId, role, session.id, jti);
  }

  private signTokens(user: any, workspaceId: string, role: string, sid: string, jti: string) {
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
      { ...basePayload, type: 'refresh', sid, jti },
      { secret: getJwtRefreshSecret(), expiresIn: REFRESH_TTL },
    );

    return { accessToken, refreshToken };
  }
}
