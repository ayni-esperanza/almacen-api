import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ example: 'admin', description: 'Username' })
  username: string;

  @ApiProperty({ example: true, description: 'Authentication status' })
  isAuthenticated: boolean;
}

export class UserDto {
  @ApiProperty({ example: 'admin', description: 'Username' })
  username: string;

  @ApiProperty({ example: true, description: 'Authentication status' })
  isAuthenticated: boolean;
}
