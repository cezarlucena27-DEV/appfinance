import { IsString, IsNumber, IsOptional, IsDateString, Min, IsIn } from 'class-validator';

const GOAL_STATUS = ['active', 'completed', 'cancelled', 'ativa', 'concluida', 'cancelada'];

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0.01)
  targetAmount: number;

  @IsDateString()
  targetDate: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateGoalDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  targetAmount?: number;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsIn(GOAL_STATUS)
  @IsOptional()
  status?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentAmount?: number;
}
