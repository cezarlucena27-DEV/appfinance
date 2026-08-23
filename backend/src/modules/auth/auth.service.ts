import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { DEFAULT_CATEGORIES } from '../../common/default-categories';
import { EmailService } from '../../common/email/email.service';
import { SUPER_ADMIN_EMAIL } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private email: EmailService,
  ) {}

  async sendVerificationCode(email: string) {
    const normalized = email.trim().toLowerCase();

    // Rate limit: 1 codigo por minuto por email
    const recent = await this.prisma.emailVerification.findFirst({
      where: { email: normalized, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });
    if (recent) {
      throw new BadRequestException('Aguarde um minuto antes de solicitar um novo codigo');
    }

    await this.prisma.emailVerification.deleteMany({ where: { email: normalized } });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.prisma.emailVerification.create({
      data: {
        email: normalized,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const viaSmtp = await this.email.sendVerificationCode(normalized, code);
    return {
      sent: true,
      channel: viaSmtp ? 'smtp' : 'fallback',
      ...(viaSmtp ? {} : { devCode: code }),
      message: viaSmtp
        ? 'Codigo enviado para o seu email. Ele expira em 15 minutos.'
        : 'SMTP nao configurado: use o codigo retornado (modo fallback de desenvolvimento).',
    };
  }

  private async consumeVerificationCode(email: string, code: string) {
    const normalized = email.trim().toLowerCase();
    const record = await this.prisma.emailVerification.findFirst({
      where: { email: normalized },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new BadRequestException('Solicite um codigo de verificacao antes de continuar');
    }
    if (record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Codigo expirado. Solicite um novo.');
    }
    if (record.attempts >= 5) {
      throw new BadRequestException('Muitas tentativas. Solicite um novo codigo.');
    }
    if (record.code !== code.trim()) {
      await this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Codigo incorreto');
    }
    await this.prisma.emailVerification.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email ja cadastrado no sistema');
    }

    await this.consumeVerificationCode(dto.email, dto.code);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const isSuperAdmin = dto.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        globalRole: isSuperAdmin ? 'platform_admin' : 'regular',
        isAdminApproved: isSuperAdmin,
        defaultsCreated: true,
      },
    });

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.workspaceName || `${dto.name}'s Workspace`,
        ownerId: user.id,
        plan: 'free',
      },
    });

    await this.prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'master',
      },
    });

    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: user.id })),
    });

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId: user.id, workspaceId: workspace.id },
    });

    const tokens = this.generateTokens(user, workspace.id, membership.role);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: {
        ...userWithoutPassword,
        workspaceId: workspace.id,
        role: membership.role,
        workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan },
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email nao cadastrado no sistema. Verifique se digitou corretamente.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const membership = await this.prisma.workspaceMember.findFirst({
        where: { userId: user.id },
      });
      const role = membership?.role || 'member';
      if (role === 'master') {
        throw new UnauthorizedException('Senha incorreta. Use "Esqueci minha senha" para redefinir.');
      }
      let masterName = '';
      let masterEmail = '';
      if (user.createdById) {
        const creator = await this.prisma.user.findUnique({ where: { id: user.createdById } });
        masterName = creator?.name || '';
        masterEmail = creator?.email || '';
      }
      if (!masterName && membership?.workspaceId) {
        const wsMaster = await this.prisma.workspaceMember.findFirst({
          where: { workspaceId: membership.workspaceId, role: 'master' },
          include: { user: true },
        });
        masterName = wsMaster?.user?.name || '';
        masterEmail = wsMaster?.user?.email || '';
      }
      const masterInfo = masterName ? ` (${masterName}${masterEmail ? ` - ${masterEmail}` : ''})` : '';
      throw new UnauthorizedException(`Senha incorreta. Solicite a redefinicao de senha ao seu usuario master${masterInfo}.`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        user.deactivatedMessage
          ? `Sua conta foi desativada. Motivo: ${user.deactivatedMessage}`
          : 'Sua conta foi desativada. Entre em contato com o administrador.'
      );
    }

    if (user.globalRole === 'platform_admin' && !user.isAdminApproved) {
      throw new UnauthorizedException('Conta de administrador aguardando aprovacao. Entre em contato com o administrador.');
    }

    const blockSubscription = await this.prisma.subscription.findUnique({ where: { userId: user.id } });
    if (blockSubscription?.blocked) {
      throw new UnauthorizedException(
        blockSubscription.blockReason === 'Falta de pagamento' || !blockSubscription.blockReason
          ? 'Sua conta esta bloqueada por falta de pagamento. Entre em contato com o financeiro.'
          : `Sua conta esta bloqueada. Motivo: ${blockSubscription.blockReason}`
      );
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
    });

    const workspaceId = membership?.workspaceId || '';
    const role = membership?.role || 'member';

    const tokens = this.generateTokens(user, workspaceId, role);
    const { passwordHash: _, ...userWithoutPassword } = user;

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date(), lastSeenAt: new Date() } });

    const subInfo = await this.prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { blocked: true, blockReason: true, accessUntil: true, nextDueDate: true },
    });

    return {
      user: {
        ...userWithoutPassword,
        workspaceId,
        role,
        workspace: membership?.workspace
          ? { id: membership.workspace.id, name: membership.workspace.name, plan: membership.workspace.plan }
          : undefined,
        subscriptionBlocked: subInfo?.blocked || false,
        blockReason: subInfo?.blockReason || null,
        accessUntil: subInfo?.accessUntil || null,
        nextDueDate: subInfo?.nextDueDate || null,
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
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'financeapp-refresh-secret-2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Sessao expirada. Entre novamente.');
      }

      const membership = await this.prisma.workspaceMember.findFirst({
        where: { userId: user.id },
      });

      const tokens = this.generateTokens(user, membership?.workspaceId || '', membership?.role || 'member');
      return tokens;
    } catch {
      throw new UnauthorizedException('Sessao expirada. Entre novamente.');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario nao encontrado');

    const isvalid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isvalid) throw new UnauthorizedException('Senha atual incorreta');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Senha alterada com sucesso' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return { registered: false, message: 'Email nao cadastrado no sistema. Verifique se digitou corretamente.' };
    }

    if (!user.isActive) {
      return {
        registered: true,
        active: false,
        message: user.deactivatedMessage
          ? `Sua conta foi desativada. Motivo: ${user.deactivatedMessage}`
          : 'Sua conta foi desativada. Entre em contato com o administrador.',
      };
    }

    const membership = await this.prisma.workspaceMember.findFirst({ where: { userId: user.id } });
    const role = membership?.role || 'member';

    if (role !== 'master') {
      let masterName = '';
      let masterEmail = '';
      if (user.createdById) {
        const creator = await this.prisma.user.findUnique({ where: { id: user.createdById } });
        masterName = creator?.name || '';
        masterEmail = creator?.email || '';
      }
      if (!masterName && membership?.workspaceId) {
        const wsMaster = await this.prisma.workspaceMember.findFirst({
          where: { workspaceId: membership.workspaceId, role: 'master' },
          include: { user: true },
        });
        masterName = wsMaster?.user?.name || '';
        masterEmail = wsMaster?.user?.email || '';
      }
      const masterInfo = masterName ? ` (${masterName}${masterEmail ? ` - ${masterEmail}` : ''})` : '';
      return {
        registered: true,
        isMaster: false,
        message: `Conta comum. Solicite a redefinicao de senha ao seu usuario master${masterInfo}.`,
      };
    }

    const tempPassword = Math.random().toString(36).slice(-12) + 'A1';
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return {
      registered: true,
      isMaster: true,
      tempPassword,
      message: 'Senha redefinida com sucesso. Use a nova senha abaixo para entrar.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'financeapp-refresh-secret-2026',
      });
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await this.prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } });
      return { message: 'Senha redefinida com sucesso' };
    } catch {
      throw new UnauthorizedException('Token invalido ou expirado');
    }
  }

  private generateTokens(user: any, workspaceId: string, role: string) {
    const payload = { sub: user.id, email: user.email, globalRole: user.globalRole, workspaceId, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'financeapp-refresh-secret-2026',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
