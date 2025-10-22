import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EquipmentResponseDto {
  @ApiProperty({ example: 1, description: 'Equipment ID' })
  id: number;

  @ApiProperty({ example: 'Taladro Bosch', description: 'Equipment name' })
  equipo: string;

  @ApiProperty({ example: 'BSH001', description: 'Serial/Code number' })
  serieCodigo: string;

  @ApiProperty({ example: 1, description: 'Equipment quantity' })
  cantidad: number;

  @ApiProperty({
    example: 'Bueno',
    description: 'Equipment condition',
    enum: ['Bueno', 'Regular', 'Malo', 'En_Reparacion', 'Danado'],
  })
  estadoEquipo: string;

  @ApiProperty({ example: 1, description: 'Responsible person ID' })
  responsableId: number;

  @ApiProperty({
    example: '2025-08-25T14:30:00.000Z',
    description: 'Exit date and time',
  })
  fechaSalida: Date;

  @ApiProperty({ example: 1, description: 'Area ID' })
  areaId: number;

  @ApiProperty({ example: 1, description: 'Project ID' })
  projectId: number;

  @ApiPropertyOptional({
    example: '2025-08-25T16:45:00.000Z',
    description: 'Return date and time',
  })
  fechaRetorno?: Date;

  @ApiPropertyOptional({
    example: 'Bueno',
    description: 'Equipment condition upon return',
    enum: ['Bueno', 'Regular', 'Malo', 'En_Reparacion', 'Danado'],
  })
  estadoRetorno?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
