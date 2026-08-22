import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CompleteOnboardingDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get()
  getStatus(@Request() req) {
    return this.onboardingService.getStatus(req.user.id);
  }

  @Post()
  complete(@Body() dto: CompleteOnboardingDto, @Request() req) {
    return this.onboardingService.complete(req.user.id, dto);
  }
}
