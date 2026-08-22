import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): Promise<{
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
    heartbeat(req: any): Promise<{
        ok: boolean;
    }>;
    changePassword(currentPassword: string, newPassword: string, req: any): Promise<{
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
}
