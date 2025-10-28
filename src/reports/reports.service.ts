import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  ExitReportResponseDto,
  ExitReportDataDto,
  ReportSummaryDto,
} from './dto/report-response.dto';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';
import { PdfExportService } from '../common/services/pdf-export.service';

// Interfaces para alertas de stock
interface StockAlert {
  id: string;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  categoria: string;
  proveedor: string;
  ultimaActualizacion: string;
  estado: 'critico' | 'bajo' | 'normal';
}

interface StockAlertFilters {
  categoria?: string;
  ubicacion?: string;
  estado?: string;
  mostrarSoloCriticos?: boolean;
}

interface StockAlertStatistics {
  total: number;
  criticos: number;
  bajos: number;
  totalStock: number;
  stockMinimo: number;
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private pdfExportService: PdfExportService,
  ) {}

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
    const totalValue = exits.reduce(
      (sum, exit) => sum + exit.cantidad * exit.precioUnitario,
      0,
    );
    const totalMovements = exits.length;

    const data: ExitReportDataDto[] = exits.map((exit) => ({
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
    const totalValue = entries.reduce(
      (sum, entry) => sum + entry.cantidad * entry.precioUnitario,
      0,
    );
    const totalMovements = entries.length;

    const data = entries.map((entry) => ({
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

    const data = equipment.map((item) => ({
      equipo: item.equipo,
      serieCodigo: item.serieCodigo,
      cantidad: item.cantidad,
      estadoEquipo: this.mapEstadoEquipoToFrontend(item.estadoEquipo),
      responsable: item.responsable,
      fechaSalida: item.fechaSalida,
      horaSalida: item.horaSalida,
      areaProyecto: item.areaProyecto,
      fechaRetorno: item.fechaRetorno,
      horaRetorno: item.horaRetorno,
      estadoRetorno: item.estadoRetorno
        ? this.mapEstadoEquipoToFrontend(item.estadoRetorno)
        : undefined,
      responsableRetorno: item.responsableRetorno,
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
      include: { provider: true },
      orderBy: { codigo: 'asc' },
    });

    // Calculate summary
    const totalItems = products.reduce(
      (sum, product) => sum + product.stockActual,
      0,
    );
    const totalValue = products.reduce(
      (sum, product) => sum + product.costoTotal,
      0,
    );
    const totalProducts = products.length;

    const data = products.map((product) => ({
      codigo: product.codigo,
      nombre: product.nombre,
      costoUnitario: product.costoUnitario,
      ubicacion: product.ubicacion,
      entradas: product.entradas,
      salidas: product.salidas,
      stockActual: product.stockActual,
      stockMinimo: product.stockMinimo,
      unidadMedida: product.unidadMedida,
      proveedor: product.provider?.name || 'Sin proveedor',
      marca: product.marca,
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
    const { type, startDate, endDate, area, responsable, proyecto } =
      generateReportDto;

    switch (type) {
      case ReportType.EXITS:
        return this.getExitsReport(
          startDate,
          endDate,
          area,
          responsable,
          proyecto,
        );

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
      Bueno: 'Bueno',
      Regular: 'Regular',
      Malo: 'Malo',
      En_Reparacion: 'En Reparación',
      Danado: 'Dañado',
    };
    return mapping[estado] || estado;
  }

  // === STOCK ALERTS METHODS ===

  async getStockAlerts(filters: StockAlertFilters): Promise<StockAlert[]> {
    const where: any = {};

    // Aplicar filtros
    if (filters.categoria) {
      where.categoria = { contains: filters.categoria, mode: 'insensitive' };
    }

    if (filters.ubicacion) {
      where.ubicacion = { contains: filters.ubicacion, mode: 'insensitive' };
    }

    // Obtener todos los productos
    const products = await this.prisma.product.findMany({
      where,
      include: { provider: true },
      orderBy: { codigo: 'asc' },
    });

    // Convertir a alertas de stock
    const alerts: StockAlert[] = products.map((product) => {
      const stockMinimo = product.stockMinimo || 10; // Usar el stock mínimo del producto o 10 por defecto
      let estado: 'critico' | 'bajo' | 'normal' = 'normal';

      if (product.stockActual === 0) {
        estado = 'critico';
      } else if (product.stockActual < stockMinimo) {
        estado = product.stockActual <= 3 ? 'critico' : 'bajo';
      }

      return {
        id: product.id.toString(),
        codigo: product.codigo,
        nombre: product.nombre,
        stockActual: product.stockActual,
        stockMinimo,
        ubicacion: product.ubicacion,
        categoria: product.categoria || 'Sin categoría',
        proveedor: product.provider?.name || 'Sin proveedor',
        ultimaActualizacion: product.updatedAt.toISOString().split('T')[0],
        estado,
      };
    });

    // Aplicar filtros adicionales
    let filteredAlerts = alerts;

    if (filters.estado) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.estado === filters.estado,
      );
    }

    if (filters.mostrarSoloCriticos) {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.estado === 'critico',
      );
    }

    return filteredAlerts;
  }

  async getStockAlert(id: string): Promise<StockAlert | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { provider: true },
    });

    if (!product) {
      return null;
    }

    const stockMinimo = product.stockMinimo || 10; // Usar el stock mínimo del producto o 10 por defecto
    let estado: 'critico' | 'bajo' | 'normal' = 'normal';

    if (product.stockActual === 0) {
      estado = 'critico';
    } else if (product.stockActual < stockMinimo) {
      estado = product.stockActual <= 3 ? 'critico' : 'bajo';
    }

    return {
      id: product.id.toString(),
      codigo: product.codigo,
      nombre: product.nombre,
      stockActual: product.stockActual,
      stockMinimo,
      ubicacion: product.ubicacion,
      categoria: product.categoria || 'Sin categoría',
      proveedor: product.provider?.name || 'Sin proveedor',
      ultimaActualizacion: product.updatedAt.toISOString().split('T')[0],
      estado,
    };
  }

  async getStockAlertStatistics(): Promise<StockAlertStatistics> {
    const products = await this.prisma.product.findMany({
      include: { provider: true },
    });

    let total = 0;
    let criticos = 0;
    let bajos = 0;
    let totalStock = 0;
    let stockMinimoTotal = 0;

    products.forEach((product) => {
      const stockMinimo = product.stockMinimo || 10; // Usar el stock mínimo del producto o 10 por defecto
      totalStock += product.stockActual;
      stockMinimoTotal += stockMinimo;

      if (product.stockActual === 0) {
        criticos++;
        total++;
      } else if (product.stockActual < stockMinimo) {
        if (product.stockActual <= 3) {
          criticos++;
        } else {
          bajos++;
        }
        total++;
      }
    });

    return {
      total,
      criticos,
      bajos,
      totalStock,
      stockMinimo: stockMinimoTotal,
    };
  }

  async getStockAlertCategories(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      select: { categoria: true },
      distinct: ['categoria'],
      where: {
        categoria: {
          not: null,
        },
      },
    });

    return products
      .map((p) => p.categoria)
      .filter((c): c is string => c !== null)
      .sort();
  }

  async getStockAlertLocations(): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      select: { ubicacion: true },
      distinct: ['ubicacion'],
    });

    return products.map((p) => p.ubicacion).sort();
  }

  // === EXPENSE REPORTS METHODS ===

  async getExpenseReports(filters: any): Promise<any[]> {
    const where: any = {};

    // Aplicar filtros de fecha
    if (filters.fechaInicio || filters.fechaFin) {
      where.fecha = {};
      if (filters.fechaInicio) {
        where.fecha.gte = filters.fechaInicio;
      }
      if (filters.fechaFin) {
        where.fecha.lte = filters.fechaFin;
      }
    }

    if (filters.area) {
      where.area = { contains: filters.area, mode: 'insensitive' };
    }

    if (filters.proyecto) {
      where.proyecto = { contains: filters.proyecto, mode: 'insensitive' };
    }

    // Obtener movimientos de salida (gastos)
    const exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return exits.map((exit) => ({
      id: exit.id,
      fecha: exit.fecha,
      codigoProducto: exit.codigoProducto,
      descripcion: exit.descripcion,
      precioUnitario: exit.precioUnitario,
      cantidad: exit.cantidad,
      total: exit.cantidad * exit.precioUnitario,
      responsable: exit.responsable,
      area: exit.area,
      proyecto: exit.proyecto,
    }));
  }

  async getMonthlyExpenseData(filters: any): Promise<any[]> {
    const exits = await this.getExpenseReports(filters);

    // Agrupar por mes
    const monthlyData = new Map<
      string,
      { gasto: number; movimientos: number }
    >();

    exits.forEach((exit) => {
      const month = exit.fecha.substring(3, 10); // DD/MM/YYYY -> MM/YYYY
      const existing = monthlyData.get(month) || { gasto: 0, movimientos: 0 };

      monthlyData.set(month, {
        gasto: existing.gasto + exit.total,
        movimientos: existing.movimientos + 1,
      });
    });

    return Array.from(monthlyData.entries()).map(([mes, data]) => ({
      mes,
      gasto: data.gasto,
      movimientos: data.movimientos,
    }));
  }

  async getAreaExpenseData(filters: any): Promise<any[]> {
    const exits = await this.getExpenseReports(filters);

    // Agrupar por área
    const areaData = new Map<
      string,
      {
        totalGasto: number;
        cantidadMovimientos: number;
        proyectos: Map<
          string,
          { totalGasto: number; cantidadMovimientos: number }
        >;
      }
    >();

    exits.forEach((exit) => {
      const area = exit.area || 'Sin área';
      const proyecto = exit.proyecto || 'Sin proyecto';

      let areaInfo = areaData.get(area);
      if (!areaInfo) {
        areaInfo = {
          totalGasto: 0,
          cantidadMovimientos: 0,
          proyectos: new Map(),
        };
        areaData.set(area, areaInfo);
      }

      areaInfo.totalGasto += exit.total;
      areaInfo.cantidadMovimientos += 1;

      let proyectoInfo = areaInfo.proyectos.get(proyecto);
      if (!proyectoInfo) {
        proyectoInfo = { totalGasto: 0, cantidadMovimientos: 0 };
        areaInfo.proyectos.set(proyecto, proyectoInfo);
      }

      proyectoInfo.totalGasto += exit.total;
      proyectoInfo.cantidadMovimientos += 1;
    });

    return Array.from(areaData.entries()).map(([area, data]) => ({
      area,
      totalGasto: data.totalGasto,
      cantidadMovimientos: data.cantidadMovimientos,
      proyectos: Array.from(data.proyectos.entries()).map(
        ([proyecto, proyectoData]) => ({
          proyecto,
          totalGasto: proyectoData.totalGasto,
          cantidadMovimientos: proyectoData.cantidadMovimientos,
        }),
      ),
    }));
  }

  // === PDF EXPORT METHODS ===

  async exportStockAlertsPDF(filters: StockAlertFilters): Promise<Buffer> {
    const alerts = await this.getStockAlerts(filters);
    const statistics = await this.getStockAlertStatistics();

    return this.pdfExportService.generateStockAlertsPDF(alerts, statistics);
  }

  async exportExpenseReportPDF(filters: any): Promise<Buffer> {
    const data = await this.getExpenseReports(filters);

    return this.pdfExportService.generateExpenseReportPDF(data, filters);
  }
}
