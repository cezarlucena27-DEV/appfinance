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
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const workspace = await this.prisma.workspace.create({
            data: {
                name: dto.workspaceName || `${dto.name}'s Workspace`,
                masterUserId: '',
                plan: 'free',
            },
        });
        const user = await this.prisma.user.create({
            data: {
                workspaceId: workspace.id,
                name: dto.name,
                email: dto.email,
                passwordHash,
                role: 'master',
            },
        });
        await this.prisma.workspace.update({
            where: { id: workspace.id },
            data: { masterUserId: user.id },
        });
        const defaultCategories = [
            { name: 'Alimentacao', icon: 'utensils', color: '#EF4444', type: 'expense', isDefault: true },
            { name: 'Transporte', icon: 'car', color: '#F59E0B', type: 'expense', isDefault: true },
            { name: 'Moradia', icon: 'home', color: '#3B82F6', type: 'expense', isDefault: true },
            { name: 'Saude', icon: 'heart', color: '#10B981', type: 'expense', isDefault: true },
            { name: 'Educacao', icon: 'book', color: '#8B5CF6', type: 'expense', isDefault: true },
            { name: 'Lazer', icon: 'gamepad', color: '#EC4899', type: 'expense', isDefault: true },
            { name: 'Salario', icon: 'briefcase', color: '#10B981', type: 'income', isDefault: true },
            { name: 'Freelance', icon: 'laptop', color: '#06B6D4', type: 'income', isDefault: true },
            { name: 'Investimentos', icon: 'trending-up', color: '#22C55E', type: 'income', isDefault: true },
            { name: 'Outros', icon: 'tag', color: '#64748B', type: 'expense', isDefault: true },
        ];
        for (const cat of defaultCategories) {
            await this.prisma.category.create({
                data: { ...cat, userId: user.id },
            });
        }
        const tokens = this.generateTokens(user);
        return { user, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const tokens = this.generateTokens(user);
        return { user, ...tokens };
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
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = this.generateTokens(user);
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role, workspaceId: user.workspaceId };
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