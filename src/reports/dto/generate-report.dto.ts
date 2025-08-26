import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  EXITS = 'exits',
  ENTRIES = 'entries',
  EQUIPMENT = 'equipment',
  INVENTORY = 'inventory'
}

export class GenerateReportDto {
  @ApiProperty({ 
    enum: ReportType, 
    example: ReportType.EXITS, 
    description: 'Type of report to generate' 
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({ example: '01/08/2025', description: 'Start date in DD/MM/YYYY format' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '31/08/2025', description: 'End date in DD/MM/YYYY format' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'MECANICA', description: 'Filter by area' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Filter by responsible person' })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({ example: 'Proyecto ABC', description: 'Filter by project (for exits)' })
  @IsString()
  @IsOptional()
  proyecto?: string;
}
