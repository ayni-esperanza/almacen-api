import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExitReportDataDto {
  @ApiProperty({ example: '25/08/2025', description: 'Exit date' })
  fecha: string;

  @ApiProperty({ example: 'AF2025', description: 'Product code' })
  codigoProducto: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product description' })
  descripcion: string;

  @ApiProperty({ example: 12.00, description: 'Unit price' })
  precioUnitario: number;

  @ApiProperty({ example: 2, description: 'Quantity exited' })
  cantidad: number;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Responsible person' })
  responsable?: string;

  @ApiPropertyOptional({ example: 'MECANICA', description: 'Source area' })
  area?: string;

  @ApiPropertyOptional({ example: 'Proyecto ABC', description: 'Project assignment' })
  proyecto?: string;
}

export class ReportSummaryDto {
  @ApiProperty({ example: 15, description: 'Total number of items in report' })
  totalItems: number;

  @ApiProperty({ example: 450.00, description: 'Total value of all items' })
  totalValue: number;

  @ApiProperty({ example: 8, description: 'Number of movements in the period' })
  totalMovements: number;

  @ApiProperty({ example: '01/08/2025', description: 'Start date of the report period' })
  startDate?: string;

  @ApiProperty({ example: '31/08/2025', description: 'End date of the report period' })
  endDate?: string;
}

export class ExitReportResponseDto {
  @ApiProperty({ type: [ExitReportDataDto], description: 'List of exit movements' })
  data: ExitReportDataDto[];

  @ApiProperty({ type: ReportSummaryDto, description: 'Report summary' })
  summary: ReportSummaryDto;
}
