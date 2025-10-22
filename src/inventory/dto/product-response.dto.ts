import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  id: number;

  @ApiProperty({ example: 'AF2025', description: 'Unique product code' })
  codigo: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product name' })
  nombre: string;

  @ApiProperty({ example: 12.0, description: 'Unit cost' })
  costoUnitario: number;

  @ApiProperty({ example: 'ALMACEN', description: 'Storage location' })
  ubicacion: string;

  @ApiProperty({ example: 3, description: 'Total entries' })
  entradas: number;

  @ApiProperty({ example: 2, description: 'Total exits' })
  salidas: number;

  @ApiProperty({ example: 1, description: 'Current stock' })
  stockActual: number;

  @ApiProperty({ example: 10, description: 'Minimum stock level' })
  stockMinimo: number;

  @ApiProperty({ example: 'und', description: 'Unit of measure' })
  unidadMedida: string;

  @ApiProperty({ example: 'FERRETERIA CENTRAL', description: 'Supplier name' })
  proveedor: string;

  @ApiPropertyOptional({ example: 'WD-40', description: 'Product brand' })
  marca?: string;

  @ApiProperty({ example: 12.0, description: 'Total cost' })
  costoTotal: number;

  @ApiPropertyOptional({
    example: 'Herramientas',
    description: 'Product category',
  })
  categoria?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
