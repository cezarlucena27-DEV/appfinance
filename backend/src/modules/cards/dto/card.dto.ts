import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateCardDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0)
  limit: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  closingDay: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;

  @IsString()
  accountId: string;
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  limit?: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  closingDay?: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  dueDay?: number;

  @IsString()
  @IsOptional()
  accountId?: string;
}
