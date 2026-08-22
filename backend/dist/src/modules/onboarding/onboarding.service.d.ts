import { PrismaService } from '../../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/onboarding.dto';
export declare class OnboardingService {
    private prisma;
    constructor(prisma: PrismaService);
    getStatus(userId: string): Promise<{
        onboardingCompleted: boolean;
    }>;
    complete(userId: string, dto: CompleteOnboardingDto): Promise<{
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
