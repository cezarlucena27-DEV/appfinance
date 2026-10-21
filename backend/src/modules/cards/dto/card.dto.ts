import { IsString, IsNumber, IsOptional, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

const CARD_BRANDS = ['visa', 'mastercard', 'elo', 'amex', 'hipercard', 'diners', 'other'];
// Codigos antigos aceitos na entrada e gravados sempre no formato canonico.
const LEGACY_BRANDS: Record<string, string> = { amge: 'amex', outra: 'other' };
const normalizeBrand = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? (LEGACY_BRANDS[value] ?? value) : value;

export class CreateCardDto {
  @IsString()
  name: string;

  @Transform(normalizeBrand)
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

  @Transform(normalizeBrand)
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
