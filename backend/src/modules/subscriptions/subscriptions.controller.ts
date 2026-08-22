import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  getCurrent(@Request() req) {
    return this.subscriptionsService.getCurrent(req.user.id);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('pix')
  getPix(@Query('plan') plan: string, @Request() req) {
    return this.subscriptionsService.getPix(req.user.id, plan);
  }

  @Get('reminder')
  getReminder(@Request() req) {
    return this.subscriptionsService.getReminder(req.user.id);
  }

  @Post('checkout')
  checkout(@Body('plan') plan: string, @Body('billingDay') billingDay: number, @Request() req) {
    return this.subscriptionsService.checkout(req.user.id, plan, billingDay);
  }

  @Post('cancel')
  cancel(@Request() req) {
    return this.subscriptionsService.cancel(req.user.id);
  }
}

@Controller('public')
export class PublicInfoController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('payment-info')
  getPaymentInfo() {
    return this.subscriptionsService.getPublicPaymentInfo();
  }
}
