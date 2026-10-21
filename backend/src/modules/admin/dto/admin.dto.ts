import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['regular', 'platform_admin'])
  globalRole?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserRoleDto {
  @IsIn(['master', 'admin', 'member'])
  role: string;
}

export class ToggleUserActiveDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class CreateAdminDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;
}

export class UpdateAdminPanelsDto {
  @IsArray()
  @IsString({ each: true })
  panels: string[];
}

export class BlockUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UnblockUserDto {
  @IsOptional()
  @IsString()
  accessUntil?: string;
}

export class RegisterPaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsString()
  dueDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class AsaasConfigDto {
  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsIn(['sandbox', 'production'])
  environment?: string;

  @IsOptional()
  @IsString()
  pixKey?: string;
}
