import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExitDto {
  @ApiProperty({
    example: '25/08/2025',
    description: 'Exit date in DD/MM/YYYY format',
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

  @ApiProperty({ example: 12.0, description: 'Unit price for this exit' })
  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @ApiProperty({ example: 2, description: 'Quantity exiting' })
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

  @ApiPropertyOptional({ example: 'MECANICA', description: 'Source area' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({
    example: 'Proyecto ABC',
    description: 'Project assignment',
  })
  @IsString()
  @IsOptional()
  proyecto?: string;
}
