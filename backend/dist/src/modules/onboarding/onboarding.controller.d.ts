import { OnboardingService } from './onboarding.service';
import { CompleteOnboardingDto } from './dto/onboarding.dto';
export declare class OnboardingController {
    private onboardingService;
    constructor(onboardingService: OnboardingService);
    getStatus(req: any): Promise<{
        onboardingCompleted: boolean;
    }>;
    complete(dto: CompleteOnboardingDto, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        passwordHash: string;
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
    }>;
}
