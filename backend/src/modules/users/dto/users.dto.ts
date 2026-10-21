import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ToggleWorkspaceUserActiveDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class UpdateWorkspaceUserRoleDto {
  @IsIn(['admin', 'member'])
  role: string;
}

export class UpdateWorkspaceUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class InviteWorkspaceUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;
}
