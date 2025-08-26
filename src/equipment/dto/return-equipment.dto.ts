import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoEquipo } from './create-equipment.dto';

export class ReturnEquipmentDto {
  @ApiProperty({ example: '25/08/2025', description: 'Return date in DD/MM/YYYY format' })
  @IsString()
  @IsNotEmpty()
  fechaRetorno: string;

  @ApiProperty({ example: '16:45', description: 'Return time in HH:MM format' })
  @IsString()
  @IsNotEmpty()
  horaRetorno: string;

  @ApiProperty({ 
    enum: EstadoEquipo, 
    example: EstadoEquipo.Bueno, 
    description: 'Equipment condition upon return' 
  })
  @IsEnum(EstadoEquipo)
  estadoRetorno: EstadoEquipo;

  @ApiPropertyOptional({ example: 'J.Pérez', description: 'Return signature' })
  @IsString()
  @IsOptional()
  firmaRetorno?: string;
}
