import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsArray, IsNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  assignedProjectIds?: number[];
} 