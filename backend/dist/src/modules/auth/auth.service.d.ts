import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        pending: boolean;
    } | {
        accessToken: string;
        refreshToken: string;
        user: {
            workspaceId: string;
            role: string;
            workspace: {
                id: string;
                name: string;
                plan: string;
            };
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            globalRole: string;
            isActive: boolean;
            deactivatedMessage: string | null;
            isAdminApproved: boolean;
            approvedBy: string | null;
            adminPanels: string;
            defaultsCreated: boolean;
            createdById: string | null;
            onboardingCompleted: boolean;
            segmentId: string | null;
            gender: string | null;
            workDaysPerMonth: number | null;
            workHoursPerDay: number | null;
            weekendWork: string;
            lastLogin: Date | null;
            lastSeenAt: Date | null;
            updatedAt: Date;
        };
        message?: undefined;
        pending?: undefined;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            workspaceId: string;
            role: string;
            workspace: {
                id: string;
                name: string;
                plan: string;
            };
            subscriptionBlocked: boolean;
            blockReason: string;
            accessUntil: Date;
            nextDueDate: Date;
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            globalRole: string;
            isActive: boolean;
            deactivatedMessage: string | null;
            isAdminApproved: boolean;
            approvedBy: string | null;
            adminPanels: string;
            defaultsCreated: boolean;
            createdById: string | null;
            onboardingCompleted: boolean;
            segmentId: string | null;
            gender: string | null;
            workDaysPerMonth: number | null;
            workHoursPerDay: number | null;
            weekendWork: string;
            lastLogin: Date | null;
            lastSeenAt: Date | null;
            updatedAt: Date;
        };
    }>;
    heartbeat(userId: string): Promise<{
        ok: boolean;
    }>;
    getProfile(userId: string): Promise<{
        workspaceId: string;
        role: string;
        workspace: {
            id: string;
            name: string;
            plan: string;
        };
        subscriptionBlocked: boolean;
        blockReason: string;
        accessUntil: Date;
        nextDueDate: Date;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        globalRole: string;
        isActive: boolean;
        isAdminApproved: boolean;
        approvedBy: string;
        adminPanels: string;
        onboardingCompleted: boolean;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        registered: boolean;
        message: string;
        active?: undefined;
        isMaster?: undefined;
        tempPassword?: undefined;
    } | {
        registered: boolean;
        active: boolean;
        message: string;
        isMaster?: undefined;
        tempPassword?: undefined;
    } | {
        registered: boolean;
        isMaster: boolean;
        message: string;
        active?: undefined;
        tempPassword?: undefined;
    } | {
        registered: boolean;
        isMaster: boolean;
        tempPassword: string;
        message: string;
        active?: undefined;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
