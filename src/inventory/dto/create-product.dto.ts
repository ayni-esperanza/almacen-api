import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'AF2025', description: 'Unique product code' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 12.0, description: 'Unit cost' })
  @IsNumber()
  @Min(0)
  costoUnitario: number;

  @ApiProperty({ example: 'ALMACEN', description: 'Storage location' })
  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @ApiProperty({ example: 3, description: 'Total entries', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  entradas?: number;

  @ApiProperty({ example: 2, description: 'Total exits', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salidas?: number;

  @ApiProperty({ example: 1, description: 'Current stock', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockActual?: number;

  @ApiProperty({ example: 10, description: 'Minimum stock level', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;

  @ApiProperty({ example: 'und', description: 'Unit of measure' })
  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @ApiProperty({ example: 1, description: 'Provider ID' })
  @IsInt()
  @IsNotEmpty()
  providerId: number;

  @ApiPropertyOptional({ example: 'WD-40', description: 'Product brand' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiProperty({
    example: 12.0,
    description: 'Total cost (calculated)',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costoTotal?: number;

  @ApiPropertyOptional({
    example: 'Herramientas',
    description: 'Product category',
  })
  @IsString()
  @IsOptional()
  categoria?: string;
}
