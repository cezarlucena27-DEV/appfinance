"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
const default_categories_1 = require("../../common/default-categories");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email ja cadastrado no sistema');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                globalRole: dto.wantsAdmin ? 'platform_admin' : 'regular',
                isAdminApproved: false,
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
            data: default_categories_1.DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: user.id })),
        });
        if (dto.wantsAdmin) {
            return { message: 'Conta criada. Aguarde a aprovacao do administrador.', pending: true };
        }
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
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email nao cadastrado no sistema. Verifique se digitou corretamente.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            const membership = await this.prisma.workspaceMember.findFirst({
                where: { userId: user.id },
            });
            const role = membership?.role || 'member';
            if (role === 'master') {
                throw new common_1.UnauthorizedException('Senha incorreta. Use "Esqueci minha senha" para redefinir.');
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
            throw new common_1.UnauthorizedException(`Senha incorreta. Solicite a redefinicao de senha ao seu usuario master${masterInfo}.`);
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException(user.deactivatedMessage
                ? `Sua conta foi desativada. Motivo: ${user.deactivatedMessage}`
                : 'Sua conta foi desativada. Entre em contato com o administrador.');
        }
        if (user.globalRole === 'platform_admin' && !user.isAdminApproved) {
            throw new common_1.UnauthorizedException('Conta de administrador aguardando aprovacao. Entre em contato com o administrador.');
        }
        const blockSubscription = await this.prisma.subscription.findUnique({ where: { userId: user.id } });
        if (blockSubscription?.blocked) {
            throw new common_1.UnauthorizedException(blockSubscription.blockReason === 'Falta de pagamento' || !blockSubscription.blockReason
                ? 'Sua conta esta bloqueada por falta de pagamento. Entre em contato com o financeiro.'
                : `Sua conta esta bloqueada. Motivo: ${blockSubscription.blockReason}`);
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
    async heartbeat(userId) {
        try {
            await this.prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
        }
        catch { }
        return { ok: true };
    }
    async getProfile(userId) {
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
        if (!user)
            return null;
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
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'financeapp-refresh-secret-2026',
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Sessao expirada. Entre novamente.');
            }
            const membership = await this.prisma.workspaceMember.findFirst({
                where: { userId: user.id },
            });
            const tokens = this.generateTokens(user, membership?.workspaceId || '', membership?.role || 'member');
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Sessao expirada. Entre novamente.');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('Usuario nao encontrado');
        const isvalid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isvalid)
            throw new common_1.UnauthorizedException('Senha atual incorreta');
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
        return { message: 'Senha alterada com sucesso' };
    }
    async forgotPassword(email) {
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
    async resetPassword(token, newPassword) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET || 'financeapp-refresh-secret-2026',
            });
            const passwordHash = await bcrypt.hash(newPassword, 12);
            await this.prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } });
            return { message: 'Senha redefinida com sucesso' };
        }
        catch {
            throw new common_1.UnauthorizedException('Token invalido ou expirado');
        }
    }
    generateTokens(user, workspaceId, role) {
        const payload = { sub: user.id, email: user.email, globalRole: user.globalRole, workspaceId, role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'financeapp-refresh-secret-2026',
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map