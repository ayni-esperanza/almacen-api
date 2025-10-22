import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntryDto {
  @ApiProperty({
    example: '2025-08-25T14:30:00.000Z',
    description: 'Entry date and time',
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

  @ApiProperty({ example: 5, description: 'Quantity entering' })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 1, description: 'Area ID' })
  @IsNumber()
  @Min(1)
  areaId: number;
}
