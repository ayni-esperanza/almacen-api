import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEntryDto {
  @ApiPropertyOptional({
    example: '25/08/2025',
    description: 'Entry date in DD/MM/YYYY format',
  })
  @IsString()
  @IsOptional()
  fecha?: string;

  @ApiPropertyOptional({
    example: 'AFLOJA TODO',
    description: 'Product description',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    example: 12.0,
    description: 'Unit price for this entry',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioUnitario?: number;

  @ApiPropertyOptional({ example: 5, description: 'Quantity entering' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  cantidad?: number;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Responsible person',
  })
  @IsString()
  @IsOptional()
  responsable?: string | null;

  @ApiPropertyOptional({ example: 'ALMACEN', description: 'Target area' })
  @IsString()
  @IsOptional()
  area?: string | null;
}
