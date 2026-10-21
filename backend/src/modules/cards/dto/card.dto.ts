import { IsString, IsNumber, IsOptional, Min, Max, IsIn } from 'class-validator';

const CARD_BRANDS = ['visa', 'mastercard', 'elo', 'amex', 'hipercard', 'diners', 'outra'];

export class CreateCardDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(CARD_BRANDS)
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
  @IsIn(CARD_BRANDS)
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
