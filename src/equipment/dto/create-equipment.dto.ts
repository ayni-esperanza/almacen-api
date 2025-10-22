import {
  IsString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoEquipo {
  Bueno = 'Bueno',
  Regular = 'Regular',
  Malo = 'Malo',
  En_Reparacion = 'En_Reparacion',
  Danado = 'Danado',
}

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Taladro Bosch', description: 'Equipment name' })
  @IsString()
  @IsNotEmpty()
  equipo: string;

  @ApiProperty({ example: 'BSH001', description: 'Serial/Code number' })
  @IsString()
  @IsNotEmpty()
  serieCodigo: string;

  @ApiProperty({ example: 1, description: 'Equipment quantity' })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({
    enum: EstadoEquipo,
    example: EstadoEquipo.Bueno,
    description: 'Equipment condition',
  })
  @IsEnum(EstadoEquipo)
  estadoEquipo: EstadoEquipo;

  @ApiProperty({ example: 1, description: 'Responsible person ID' })
  @IsNumber()
  @IsNotEmpty()
  responsableId: number;

  @ApiProperty({
    example: '2025-08-25T14:30:00.000Z',
    description: 'Exit date and time',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaSalida: string;

  @ApiProperty({ example: 1, description: 'Area ID' })
  @IsNumber()
  @IsNotEmpty()
  areaId: number;

  @ApiProperty({ example: 1, description: 'Project ID' })
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
