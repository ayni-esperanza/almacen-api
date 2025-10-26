import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExitDto {
  @ApiPropertyOptional({
    example: '25/08/2025',
    description: 'Exit date in DD/MM/YYYY format',
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
    description: 'Unit price for this exit',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioUnitario?: number;

  @ApiPropertyOptional({ example: 5, description: 'Quantity exiting' })
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

  @ApiPropertyOptional({ example: 'ALMACEN', description: 'Area' })
  @IsString()
  @IsOptional()
  area?: string | null;

  @ApiPropertyOptional({
    example: 'Proyecto Alpha',
    description: 'Project name',
  })
  @IsString()
  @IsOptional()
  proyecto?: string | null;
}
