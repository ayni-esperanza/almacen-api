import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoEquipo {
  Bueno = 'Bueno',
  Regular = 'Regular',
  Malo = 'Malo',
  En_Reparacion = 'En Reparación',
  Danado = 'Dañado',
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

  @ApiProperty({ example: 'Juan Pérez', description: 'Responsible person' })
  @IsString()
  @IsNotEmpty()
  responsable: string;

  @ApiProperty({
    example: '25/08/2025',
    description: 'Exit date in DD/MM/YYYY format',
  })
  @IsString()
  @IsNotEmpty()
  fechaSalida: string;

  @ApiProperty({ example: '14:30', description: 'Exit time in HH:MM format' })
  @IsString()
  @IsNotEmpty()
  horaSalida: string;

  @ApiProperty({ example: 'MECANICA', description: 'Area or project' })
  @IsString()
  @IsNotEmpty()
  areaProyecto: string;
}
