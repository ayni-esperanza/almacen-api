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
    enum: ['Bueno', 'Regular', 'Malo', 'En Reparación', 'Dañado']
  })
  estadoEquipo: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Responsible person' })
  responsable: string;

  @ApiProperty({ example: '25/08/2025', description: 'Exit date' })
  fechaSalida: string;

  @ApiProperty({ example: '14:30', description: 'Exit time' })
  horaSalida: string;

  @ApiProperty({ example: 'MECANICA', description: 'Area or project' })
  areaProyecto: string;

  @ApiProperty({ example: 'J.Pérez', description: 'Responsible person signature' })
  firma: string;

  @ApiPropertyOptional({ example: '25/08/2025', description: 'Return date' })
  fechaRetorno?: string;

  @ApiPropertyOptional({ example: '16:45', description: 'Return time' })
  horaRetorno?: string;

  @ApiPropertyOptional({ 
    example: 'Bueno', 
    description: 'Equipment condition upon return',
    enum: ['Bueno', 'Regular', 'Malo', 'En Reparación', 'Dañado']
  })
  estadoRetorno?: string;

  @ApiPropertyOptional({ example: 'J.Pérez', description: 'Return signature' })
  firmaRetorno?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
