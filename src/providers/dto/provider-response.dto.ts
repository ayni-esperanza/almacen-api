import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderResponseDto {
  @ApiProperty({ example: 1, description: 'Provider ID' })
  id: number;

  @ApiProperty({ example: 'FERRETERIA CENTRAL', description: 'Provider name' })
  name: string;

  @ApiProperty({
    example: 'contacto@ferreteria.com',
    description: 'Provider email',
  })
  email: string;

  @ApiProperty({
    example: 'Av. Industrial 123, Lima',
    description: 'Provider address',
  })
  address: string;

  @ApiProperty({
    example: ['+51 999888777', '+51 999777666'],
    description: 'Provider phone numbers',
    type: [String],
  })
  phones: string[];

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Provider photo URL',
  })
  photoUrl?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
