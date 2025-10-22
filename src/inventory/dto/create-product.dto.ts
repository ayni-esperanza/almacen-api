import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
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

  @ApiPropertyOptional({ example: 'WD-40', description: 'Product brand' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiProperty({ example: 12.0, description: 'Unit cost' })
  @IsNumber()
  @Min(0)
  costoUnitario: number;

  @ApiProperty({ example: 5, description: 'Minimum stock level', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;

  @ApiProperty({ example: 1, description: 'Provider ID' })
  @IsNumber()
  @Min(1)
  providerId: number;

  @ApiProperty({ example: 1, description: 'Location ID' })
  @IsNumber()
  @Min(1)
  locationId: number;

  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsNumber()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 1, description: 'Unit of measure ID' })
  @IsNumber()
  @Min(1)
  unitId: number;

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

  @ApiPropertyOptional({
    example: 'Notes about the product',
    description: 'Additional observations',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
