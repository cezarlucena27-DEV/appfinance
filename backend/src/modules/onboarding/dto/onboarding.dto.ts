import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @IsOptional()
  segmentId?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNumber()
  @IsOptional()
  workDaysPerMonth?: number;

  @IsNumber()
  @IsOptional()
  workHoursPerDay?: number;

  @IsString()
  @IsOptional()
  weekendWork?: string;
}
