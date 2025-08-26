import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ExitReportResponseDto } from './dto/report-response.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('exits')
  @ApiOperation({ summary: 'Get exits report data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in DD/MM/YYYY format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in DD/MM/YYYY format' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({ name: 'responsable', required: false, description: 'Filter by responsible person' })
  @ApiQuery({ name: 'proyecto', required: false, description: 'Filter by project' })
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
    return this.reportsService.getExitsReport(startDate, endDate, area, responsable, proyecto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get entries report data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in DD/MM/YYYY format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in DD/MM/YYYY format' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({ name: 'responsable', required: false, description: 'Filter by responsible person' })
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
    return this.reportsService.getEntriesReport(startDate, endDate, area, responsable);
  }

  @Get('equipment')
  @ApiOperation({ summary: 'Get equipment report data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in DD/MM/YYYY format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in DD/MM/YYYY format' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area' })
  @ApiQuery({ name: 'responsable', required: false, description: 'Filter by responsible person' })
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
    return this.reportsService.getEquipmentReport(startDate, endDate, area, responsable);
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
  @ApiOperation({ summary: 'Generate custom report' })
  @ApiResponse({
    status: 201,
    description: 'Report generated successfully',
  })
  generateReport(@Body() generateReportDto: GenerateReportDto): Promise<any> {
    return this.reportsService.generateReport(generateReportDto);
  }
}
