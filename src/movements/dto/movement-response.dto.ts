import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MovementEntryResponseDto {
  @ApiProperty({ example: 1, description: 'Entry ID' })
  id: number;

  @ApiProperty({ example: '25/08/2025', description: 'Entry date' })
  fecha: string;

  @ApiProperty({ example: 'AF2025', description: 'Product code' })
  codigoProducto: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  descripcion: string;

  @ApiProperty({ example: 12.0, description: 'Unit price' })
  precioUnitario: number;

  @ApiProperty({ example: 5, description: 'Quantity entered' })
  cantidad: number;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Responsible person',
  })
  responsable?: string;

  @ApiPropertyOptional({ example: 'ALMACEN', description: 'Target area' })
  area?: string;

  @ApiPropertyOptional({ example: 'EPP', description: 'Product category' })
  categoria?: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MovementExitResponseDto {
  @ApiProperty({ example: 1, description: 'Exit ID' })
  id: number;

  @ApiProperty({ example: '25/08/2025', description: 'Exit date' })
  fecha: string;

  @ApiProperty({ example: 'AF2025', description: 'Product code' })
  codigoProducto: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  descripcion: string;

  @ApiProperty({ example: 12.0, description: 'Unit price' })
  precioUnitario: number;

  @ApiProperty({ example: 2, description: 'Quantity exited' })
  cantidad: number;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Responsible person',
  })
  responsable?: string;

  @ApiPropertyOptional({ example: 'MECANICA', description: 'Source area' })
  area?: string;

  @ApiPropertyOptional({
    example: 'Proyecto ABC',
    description: 'Project assignment',
  })
  proyecto?: string;
  @ApiPropertyOptional({ example: 'EPP', description: 'Product category' })
  categoria?: string | null;
  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
