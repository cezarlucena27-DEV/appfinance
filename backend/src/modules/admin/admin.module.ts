import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditService } from './audit.service';
import { OnlineTracker } from './online-tracker.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from '../../common/security.config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [AdminService, AuditService, OnlineTracker],
  controllers: [AdminController],
  exports: [AdminService, AuditService, OnlineTracker],
})
export class AdminModule {}
