import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ExitReportResponseDto } from './dto/report-response.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { StockDashboardDto } from './dto/stock-dashboard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permissions.enum';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.REPORTS_READ)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('stock-dashboard')
  @ApiOperation({ summary: 'Get stock dashboard metrics' })
  @ApiQuery({
    name: 'periodoAnalisisDias',
    required: false,
    description:
      'Período en días para calcular el producto más movido (default: 30)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock dashboard metrics retrieved successfully',
    type: StockDashboardDto,
  })
  getStockDashboard(
    @Query('periodoAnalisisDias') periodoAnalisisDias?: number,
  ): Promise<StockDashboardDto> {
    return this.reportsService.getStockDashboard(periodoAnalisisDias || 30);
  }

  @Get('exits')
  @ApiOperation({ summary: 'Get exits report data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in DD/MM/YYYY format',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in DD/MM/YYYY format',
  })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'responsable',
    required: false,
    description: 'Filter by responsible person',
  })
  @ApiQuery({
    name: 'proyecto',
    required: false,
    description: 'Filter by project',
  })
  @ApiResponse({
    status: 200,
    description: 'Exits report data retrieved successfully',
    type: ExitReportResponseDto,
  })
  getExitsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('area') area?: string,
    @Query('responsable') responsable?: string,
    @Query('proyecto') proyecto?: string,
  ): Promise<ExitReportResponseDto> {
    return this.reportsService.getExitsReport(
      startDate,
      endDate,
      area,
      responsable,
      proyecto,
    );
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get entries report data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in DD/MM/YYYY format',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in DD/MM/YYYY format',
  })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'responsable',
    required: false,
    description: 'Filter by responsible person',
  })
  @ApiResponse({
    status: 200,
    description: 'Entries report data retrieved successfully',
  })
  getEntriesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('area') area?: string,
    @Query('responsable') responsable?: string,
  ): Promise<any> {
    return this.reportsService.getEntriesReport(
      startDate,
      endDate,
      area,
      responsable,
    );
  }

  @Get('equipment')
  @ApiOperation({ summary: 'Get equipment report data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in DD/MM/YYYY format',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in DD/MM/YYYY format',
  })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'responsable',
    required: false,
    description: 'Filter by responsible person',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipment report data retrieved successfully',
  })
  getEquipmentReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('area') area?: string,
    @Query('responsable') responsable?: string,
  ): Promise<any> {
    return this.reportsService.getEquipmentReport(
      startDate,
      endDate,
      area,
      responsable,
    );
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report data' })
  @ApiResponse({
    status: 200,
    description: 'Inventory report data retrieved successfully',
  })
  getInventoryReport(): Promise<any> {
    return this.reportsService.getInventoryReport();
  }

  @Post('generate')
  @RequirePermissions(Permission.REPORTS_GENERATE)
  @ApiOperation({ summary: 'Generate custom report' })
  @ApiResponse({
    status: 201,
    description: 'Report generated successfully',
  })
  generateReport(@Body() generateReportDto: GenerateReportDto): Promise<any> {
    return this.reportsService.generateReport(generateReportDto);
  }

  // === STOCK ALERTS ENDPOINTS ===

  @Get('stock-alerts')
  @ApiOperation({ summary: 'Get stock alerts' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'ubicacion',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'soloCriticos',
    required: false,
    description: 'Show only critical alerts',
  })
  @ApiQuery({
    name: 'ocultarVistas',
    required: false,
    description: 'Hide viewed alerts (for notification bell)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock alerts retrieved successfully',
  })
  getStockAlerts(
    @Query('categoria') categoria?: string,
    @Query('ubicacion') ubicacion?: string,
    @Query('estado') estado?: string,
    @Query('soloCriticos') soloCriticos?: string,
    @Query('ocultarVistas') ocultarVistas?: string,
  ): Promise<any[]> {
    const filters = {
      categoria,
      ubicacion,
      estado,
      mostrarSoloCriticos: soloCriticos === 'true',
      ocultarVistas: ocultarVistas === 'true',
    };
    return this.reportsService.getStockAlerts(filters);
  }

  @Get('stock-alerts/:id')
  @ApiOperation({ summary: 'Get stock alert by ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock alert retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock alert not found',
  })
  getStockAlert(@Param('id') id: string): Promise<any> {
    return this.reportsService.getStockAlert(id);
  }

  @Post('stock-alerts/:id/mark-viewed')
  @ApiOperation({ summary: 'Mark stock alert as viewed' })
  @ApiResponse({
    status: 200,
    description: 'Stock alert marked as viewed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock alert not found',
  })
  markAlertAsViewed(@Param('id') id: string): Promise<any> {
    return this.reportsService.markAlertAsViewed(id);
  }

  @Get('stock-alerts/statistics')
  @ApiOperation({ summary: 'Get stock alert statistics' })
  @ApiResponse({
    status: 200,
    description: 'Stock alert statistics retrieved successfully',
  })
  getStockAlertStatistics(): Promise<any> {
    return this.reportsService.getStockAlertStatistics();
  }

  @Get('stock-alerts/filters/categories')
  @ApiOperation({ summary: 'Get all available categories for stock alerts' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  getStockAlertCategories(): Promise<string[]> {
    return this.reportsService.getStockAlertCategories();
  }

  @Get('stock-alerts/filters/locations')
  @ApiOperation({ summary: 'Get all available locations for stock alerts' })
  @ApiResponse({
    status: 200,
    description: 'Locations retrieved successfully',
  })
  getStockAlertLocations(): Promise<string[]> {
    return this.reportsService.getStockAlertLocations();
  }

  // === EXPENSE REPORTS ENDPOINTS ===

  @Get('expenses')
  @ApiOperation({ summary: 'Get expense reports' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Start date' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'End date' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'proyecto',
    required: false,
    description: 'Filter by project',
  })
  @ApiQuery({
    name: 'tipoReporte',
    required: false,
    description: 'Report type',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense reports retrieved successfully',
  })
  getExpenseReports(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('area') area?: string,
    @Query('proyecto') proyecto?: string,
    @Query('tipoReporte') tipoReporte?: string,
  ): Promise<any[]> {
    const filters = {
      fechaInicio,
      fechaFin,
      area,
      proyecto,
      tipoReporte,
    };
    return this.reportsService.getExpenseReports(filters);
  }

  @Get('expenses/monthly')
  @ApiOperation({ summary: 'Get monthly expense data' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Start date' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'End date' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'proyecto',
    required: false,
    description: 'Filter by project',
  })
  @ApiQuery({
    name: 'tipoReporte',
    required: false,
    description: 'Report type',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly expense data retrieved successfully',
  })
  getMonthlyExpenseData(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('area') area?: string,
    @Query('proyecto') proyecto?: string,
    @Query('tipoReporte') tipoReporte?: string,
  ): Promise<any[]> {
    const filters = {
      fechaInicio,
      fechaFin,
      area,
      proyecto,
      tipoReporte,
    };
    return this.reportsService.getMonthlyExpenseData(filters);
  }

  @Get('expenses/area')
  @ApiOperation({ summary: 'Get area expense data' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Start date' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'End date' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'proyecto',
    required: false,
    description: 'Filter by project',
  })
  @ApiQuery({
    name: 'tipoReporte',
    required: false,
    description: 'Report type',
  })
  @ApiResponse({
    status: 200,
    description: 'Area expense data retrieved successfully',
  })
  getAreaExpenseData(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('area') area?: string,
    @Query('proyecto') proyecto?: string,
    @Query('tipoReporte') tipoReporte?: string,
  ): Promise<any[]> {
    const filters = {
      fechaInicio,
      fechaFin,
      area,
      proyecto,
      tipoReporte,
    };
    return this.reportsService.getAreaExpenseData(filters);
  }

  // === PDF EXPORT ENDPOINTS ===

  @Get('stock-alerts/export')
  @RequirePermissions(Permission.REPORTS_GENERATE)
  @ApiOperation({ summary: 'Export stock alerts to PDF' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'ubicacion',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'soloCriticos',
    required: false,
    description: 'Show only critical alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF file generated successfully',
  })
  async exportStockAlertsPDF(
    @Res() res: Response,
    @Query('categoria') categoria?: string,
    @Query('ubicacion') ubicacion?: string,
    @Query('estado') estado?: string,
    @Query('soloCriticos') soloCriticos?: string,
  ): Promise<void> {
    const filters = {
      categoria,
      ubicacion,
      estado,
      mostrarSoloCriticos: soloCriticos === 'true',
    };

    const pdfBuffer = await this.reportsService.exportStockAlertsPDF(filters);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="alertas-stock-${new Date().toISOString().split('T')[0]}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Get('expenses/export')
  @RequirePermissions(Permission.REPORTS_GENERATE)
  @ApiOperation({ summary: 'Export expense report to PDF' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Start date' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'End date' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({
    name: 'proyecto',
    required: false,
    description: 'Filter by project',
  })
  @ApiQuery({
    name: 'tipoReporte',
    required: false,
    description: 'Report type',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF file generated successfully',
  })
  async exportExpenseReportPDF(
    @Res() res: Response,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('area') area?: string,
    @Query('proyecto') proyecto?: string,
    @Query('tipoReporte') tipoReporte?: string,
  ): Promise<void> {
    const filters = {
      fechaInicio,
      fechaFin,
      area,
      proyecto,
      tipoReporte,
    };

    const pdfBuffer = await this.reportsService.exportExpenseReportPDF(filters);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-gastos-${new Date().toISOString().split('T')[0]}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
