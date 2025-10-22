import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  id: number;

  @ApiProperty({ example: 'AF2025', description: 'Unique product code' })
  codigo: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product name' })
  nombre: string;

  @ApiPropertyOptional({ example: 'WD-40', description: 'Product brand' })
  marca?: string;

  @ApiProperty({ example: 12.0, description: 'Unit cost' })
  costoUnitario: number;

  @ApiProperty({ example: 5, description: 'Minimum stock level' })
  stockMinimo: number;

  @ApiProperty({ example: 1, description: 'Provider ID' })
  providerId: number;

  @ApiProperty({ example: 1, description: 'Location ID' })
  locationId: number;

  @ApiProperty({ example: 1, description: 'Category ID' })
  categoryId: number;

  @ApiProperty({ example: 1, description: 'Unit of measure ID' })
  unitId: number;

  @ApiProperty({ example: 3, description: 'Total entries' })
  entradas: number;

  @ApiProperty({ example: 2, description: 'Total exits' })
  salidas: number;

  @ApiProperty({ example: 1, description: 'Current stock' })
  stockActual: number;

  @ApiPropertyOptional({
    example: 'Notes about the product',
    description: 'Additional observations',
  })
  observaciones?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
