import { Module } from '@nestjs/common';
import { PaymentReceiptsService } from './payment-receipts.service';
import { PublicPaymentReceiptsController, AdminPaymentReceiptsController } from './payment-receipts.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentReceiptsService],
  controllers: [PublicPaymentReceiptsController, AdminPaymentReceiptsController],
  exports: [PaymentReceiptsService],
})
export class PaymentReceiptsModule {}
