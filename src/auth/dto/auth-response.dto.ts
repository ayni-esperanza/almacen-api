import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/permissions.enum';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({ example: 'admin', description: 'Username' })
  username: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.GERENTE,
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({ example: true, description: 'Authentication status' })
  isAuthenticated: boolean;
}

export class UserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'admin', description: 'Username' })
  username: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email',
    required: false,
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    example: 'John',
    description: 'First name',
    required: false,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    required: false,
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    example: '+51 987654321',
    description: 'Phone number',
    required: false,
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.GERENTE,
    description: 'User role',
  })
  role: UserRole;

  @ApiProperty({ example: true, description: 'Account active status' })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Authentication status' })
  isAuthenticated: boolean;
}
