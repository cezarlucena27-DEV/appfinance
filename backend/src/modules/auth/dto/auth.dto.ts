import { IsEmail, IsString, MinLength, IsOptional, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(6, 6)
  code: string;

  @IsString()
  @IsOptional()
  workspaceName?: string;
}

export class SendVerificationDto {
  @IsEmail()
  email: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
