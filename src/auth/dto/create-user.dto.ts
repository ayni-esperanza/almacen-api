import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/permissions.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'juan.perez', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'juan.perez@example.com',
    description: 'User email',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Email must have a valid domain (e.g., user@domain.com)',
  })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Juan', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+51 987654321',
    description: 'Phone number',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.AYUDANTE,
    description: 'User role',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
