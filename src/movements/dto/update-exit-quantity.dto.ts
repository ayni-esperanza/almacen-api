import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExitQuantityDto {
  @ApiProperty({ example: 3, description: 'New quantity for the exit' })
  @IsNumber()
  @Min(1)
  cantidad: number;
}
