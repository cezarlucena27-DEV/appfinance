import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsIn } from 'class-validator';

const ACCOUNT_TYPES = [
  'wallet', 'checking', 'savings', 'cash', 'credit', 'investment',
  'corrente', 'poupanca', 'dinheiro', 'credito', 'investimento',
];

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(ACCOUNT_TYPES)
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  initialBalance: number;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsIn(ACCOUNT_TYPES)
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  initialBalance?: number;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
