import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { ExitReportResponseDto, ExitReportDataDto, ReportSummaryDto } from './dto/report-response.dto';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getExitsReport(
    startDate?: string,
    endDate?: string,
    area?: string,
    responsable?: string,
    proyecto?: string,
  ): Promise<ExitReportResponseDto> {
    const where: any = {};

    // Apply filters
    if (startDate || endDate) {
      where.fecha = {};
      if (startDate) {
        // For date comparison, we'll use string comparison since dates are stored as strings
        where.fecha.gte = startDate;
      }
      if (endDate) {
        where.fecha.lte = endDate;
      }
    }

    if (area) {
      where.area = { contains: area, mode: 'insensitive' };
    }

    if (responsable) {
      where.responsable = { contains: responsable, mode: 'insensitive' };
    }

    if (proyecto) {
      where.proyecto = { contains: proyecto, mode: 'insensitive' };
    }

    const exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const totalItems = exits.reduce((sum, exit) => sum + exit.cantidad, 0);
    const totalValue = exits.reduce((sum, exit) => sum + (exit.cantidad * exit.precioUnitario), 0);
    const totalMovements = exits.length;

    const data: ExitReportDataDto[] = exits.map(exit => ({
      fecha: exit.fecha,
      codigoProducto: exit.codigoProducto,
      descripcion: exit.descripcion,
      precioUnitario: exit.precioUnitario,
      cantidad: exit.cantidad,
      responsable: exit.responsable || undefined,
      area: exit.area || undefined,
      proyecto: exit.proyecto || undefined,
    }));

    const summary: ReportSummaryDto = {
      totalItems,
      totalValue,
      totalMovements,
      startDate,
      endDate,
    };

    return { data, summary };
  }

  async getEntriesReport(
    startDate?: string,
    endDate?: string,
    area?: string,
    responsable?: string,
  ): Promise<any> {
    const where: any = {};

    // Apply filters
    if (startDate || endDate) {
      where.fecha = {};
      if (startDate) {
        where.fecha.gte = startDate;
      }
      if (endDate) {
        where.fecha.lte = endDate;
      }
    }

    if (area) {
      where.area = { contains: area, mode: 'insensitive' };
    }

    if (responsable) {
      where.responsable = { contains: responsable, mode: 'insensitive' };
    }

    const entries = await this.prisma.movementEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const totalItems = entries.reduce((sum, entry) => sum + entry.cantidad, 0);
    const totalValue = entries.reduce((sum, entry) => sum + (entry.cantidad * entry.precioUnitario), 0);
    const totalMovements = entries.length;

    const data = entries.map(entry => ({
      fecha: entry.fecha,
      codigoProducto: entry.codigoProducto,
      descripcion: entry.descripcion,
      precioUnitario: entry.precioUnitario,
      cantidad: entry.cantidad,
      responsable: entry.responsable || undefined,
      area: entry.area || undefined,
    }));

    const summary: ReportSummaryDto = {
      totalItems,
      totalValue,
      totalMovements,
      startDate,
      endDate,
    };

    return { data, summary };
  }

  async getEquipmentReport(
    startDate?: string,
    endDate?: string,
    area?: string,
    responsable?: string,
  ): Promise<any> {
    const where: any = {};

    // Apply filters
    if (startDate || endDate) {
      where.fechaSalida = {};
      if (startDate) {
        where.fechaSalida.gte = startDate;
      }
      if (endDate) {
        where.fechaSalida.lte = endDate;
      }
    }

    if (area) {
      where.areaProyecto = { contains: area, mode: 'insensitive' };
    }

    if (responsable) {
      where.responsable = { contains: responsable, mode: 'insensitive' };
    }

    const equipment = await this.prisma.equipmentReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary
    const totalItems = equipment.reduce((sum, item) => sum + item.cantidad, 0);
    const totalMovements = equipment.length;

    const data = equipment.map(item => ({
      equipo: item.equipo,
      serieCodigo: item.serieCodigo,
      cantidad: item.cantidad,
      estadoEquipo: this.mapEstadoEquipoToFrontend(item.estadoEquipo),
      responsable: item.responsable,
      fechaSalida: item.fechaSalida,
      horaSalida: item.horaSalida,
      areaProyecto: item.areaProyecto,
      firma: item.firma,
      fechaRetorno: item.fechaRetorno,
      horaRetorno: item.horaRetorno,
      estadoRetorno: item.estadoRetorno ? this.mapEstadoEquipoToFrontend(item.estadoRetorno) : undefined,
      firmaRetorno: item.firmaRetorno,
    }));

    const summary = {
      totalItems,
      totalValue: 0, // Equipment doesn't have monetary value in this context
      totalMovements,
      startDate,
      endDate,
    };

    return { data, summary };
  }

  async getInventoryReport(): Promise<any> {
    const products = await this.prisma.product.findMany({
      orderBy: { codigo: 'asc' },
    });

    // Calculate summary
    const totalItems = products.reduce((sum, product) => sum + product.stockActual, 0);
    const totalValue = products.reduce((sum, product) => sum + product.costoTotal, 0);
    const totalProducts = products.length;

    const data = products.map(product => ({
      codigo: product.codigo,
      descripcion: product.descripcion,
      costoUnitario: product.costoUnitario,
      ubicacion: product.ubicacion,
      entradas: product.entradas,
      salidas: product.salidas,
      stockActual: product.stockActual,
      unidadMedida: product.unidadMedida,
      proveedor: product.proveedor,
      costoTotal: product.costoTotal,
      categoria: product.categoria,
    }));

    const summary = {
      totalItems,
      totalValue,
      totalMovements: totalProducts,
    };

    return { data, summary };
  }

  async generateReport(generateReportDto: GenerateReportDto): Promise<any> {
    const { type, startDate, endDate, area, responsable, proyecto } = generateReportDto;

    switch (type) {
      case ReportType.EXITS:
        return this.getExitsReport(startDate, endDate, area, responsable, proyecto);
      
      case ReportType.ENTRIES:
        return this.getEntriesReport(startDate, endDate, area, responsable);
      
      case ReportType.EQUIPMENT:
        return this.getEquipmentReport(startDate, endDate, area, responsable);
      
      case ReportType.INVENTORY:
        return this.getInventoryReport();
      
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  // Helper method to map Prisma enum to frontend format
  private mapEstadoEquipoToFrontend(estado: any): string {
    const mapping = {
      'Bueno': 'Bueno',
      'Regular': 'Regular',
      'Malo': 'Malo',
      'En_Reparacion': 'En Reparación',
      'Danado': 'Dañado'
    };
    return mapping[estado] || estado;
  }
}
