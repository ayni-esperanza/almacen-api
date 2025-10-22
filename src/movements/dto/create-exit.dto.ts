import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExitDto {
  @ApiProperty({
    example: '2025-08-25T14:30:00.000Z',
    description: 'Exit date and time',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha: Date;

  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 2, description: 'Quantity exiting' })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 1, description: 'Responsible person ID' })
  @IsNumber()
  @Min(1)
  responsableId: number;

  @ApiProperty({ example: 1, description: 'Area ID' })
  @IsNumber()
  @Min(1)
  areaId: number;

  @ApiProperty({ example: 1, description: 'Project ID' })
  @IsNumber()
  @Min(1)
  projectId: number;
}
