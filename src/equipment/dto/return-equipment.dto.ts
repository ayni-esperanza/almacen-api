import { IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoEquipo } from './create-equipment.dto';

export class ReturnEquipmentDto {
  @ApiProperty({
    example: '2025-08-25T16:45:00.000Z',
    description: 'Return date and time',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaRetorno: string;

  @ApiProperty({
    enum: EstadoEquipo,
    example: EstadoEquipo.Bueno,
    description: 'Equipment condition upon return',
  })
  @IsEnum(EstadoEquipo)
  estadoRetorno: EstadoEquipo;
}
