import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntryDto {
  @ApiProperty({
    example: '25/08/2025',
    description: 'Entry date in DD/MM/YYYY format',
  })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: 'AF2025', description: 'Product code' })
  @IsString()
  @IsNotEmpty()
  codigoProducto: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 12.0, description: 'Unit price for this entry' })
  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @ApiProperty({ example: 5, description: 'Quantity entering' })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Responsible person',
  })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({ example: 'ALMACEN', description: 'Target area' })
  @IsString()
  @IsOptional()
  area?: string;
}
