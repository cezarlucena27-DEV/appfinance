import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController, PublicInfoController } from './subscriptions.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController, PublicInfoController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
