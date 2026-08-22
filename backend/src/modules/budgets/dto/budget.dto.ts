import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(1)
  month: number;

  @IsNumber()
  @Min(2020)
  year: number;

  @IsNumber()
  @Min(0.01)
  limitAmount: number;
}

export class UpdateBudgetDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  month?: number;

  @IsNumber()
  @Min(2020)
  @IsOptional()
  year?: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  limitAmount?: number;
}
