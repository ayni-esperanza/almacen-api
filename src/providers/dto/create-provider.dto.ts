import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    example: 'FERRETERIA CENTRAL',
    description: 'Provider name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'contacto@ferreteria.com',
    description: 'Provider email',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Email must have a valid domain (e.g., user@domain.com)',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Av. Industrial 123, Lima',
    description: 'Provider address',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: ['+51 999888777', '+51 999777666'],
    description: 'Provider phone numbers',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  phones: string[];

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Provider photo URL',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
