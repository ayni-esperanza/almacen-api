import { ApiProperty } from '@nestjs/swagger';

export class MovementEntryResponseDto {
  @ApiProperty({ example: 1, description: 'Entry ID' })
  id: number;

  @ApiProperty({
    example: '2025-08-25T14:30:00.000Z',
    description: 'Entry date and time',
  })
  fecha: Date;

  @ApiProperty({ example: 1, description: 'Product ID' })
  productId: number;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  descripcion: string;

  @ApiProperty({ example: 5, description: 'Quantity entered' })
  cantidad: number;

  @ApiProperty({ example: 1, description: 'Area ID' })
  areaId: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MovementExitResponseDto {
  @ApiProperty({ example: 1, description: 'Exit ID' })
  id: number;

  @ApiProperty({
    example: '2025-08-25T14:30:00.000Z',
    description: 'Exit date and time',
  })
  fecha: Date;

  @ApiProperty({ example: 1, description: 'Product ID' })
  productId: number;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  descripcion: string;

  @ApiProperty({ example: 2, description: 'Quantity exited' })
  cantidad: number;

  @ApiProperty({ example: 1, description: 'Responsible person ID' })
  responsableId: number;

  @ApiProperty({ example: 1, description: 'Area ID' })
  areaId: number;

  @ApiProperty({ example: 1, description: 'Project ID' })
  projectId: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
