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
  descripcion: string;
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

    // Aplicar filtros
    if (startDate || endDate) {
      where.fecha = {};
      if (startDate) {
        where.fecha.gte = new Date(startDate);
      }
      if (endDate) {
        where.fecha.lte = new Date(endDate);
      }
    }

    // TODO: Filtros deshabilitados debido a migración de schema
    // area, responsable, proyecto ahora son IDs (areaId, responsableId, projectId)
    // Estos parámetros se mantienen por compatibilidad de API pero no pueden usarse para filtrar
    // Para re-habilitar: aceptar IDs desde el frontend o implementar búsqueda por relaciones
    void area;
    void responsable;
    void proyecto;

    const exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true, // Incluir producto para obtener el código
      },
    });

    // Calcular resumen
    const totalItems = exits.reduce((sum, exit) => sum + exit.cantidad, 0);
    const totalValue = 0; // precioUnitario fue eliminado del schema
    const totalMovements = exits.length;

    const data: ExitReportDataDto[] = exits.map((exit) => ({
      fecha: exit.fecha.toISOString(),
      codigoProducto: exit.product.codigo,
      descripcion: exit.descripcion,
      precioUnitario: 0, // Campo eliminado del schema
      cantidad: exit.cantidad,
      responsable: exit.responsableId.toString(),
      area: exit.areaId.toString(),
      proyecto: exit.projectId.toString(),
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

    // Aplicar filtros
    if (startDate || endDate) {
      where.fecha = {};
      if (startDate) {
        where.fecha.gte = new Date(startDate);
      }
      if (endDate) {
        where.fecha.lte = new Date(endDate);
      }
    }

    // TODO: Filtros deshabilitados debido a migración de schema
    // MovementEntry no tiene campo responsable
    // area ahora es areaId (requiere filtrado por ID)
    void area;
    void responsable;

    const entries = await this.prisma.movementEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true, // Incluir producto para obtener el código
      },
    });

    // Calcular resumen
    const totalItems = entries.reduce((sum, entry) => sum + entry.cantidad, 0);
    const totalValue = 0; // precioUnitario fue eliminado del schema
    const totalMovements = entries.length;

    const data = entries.map((entry) => ({
      fecha: entry.fecha.toISOString(),
      codigoProducto: entry.product.codigo,
      descripcion: entry.descripcion,
      precioUnitario: 0, // Campo eliminado del schema
      cantidad: entry.cantidad,
      responsable: undefined, // MovementEntry no tiene responsable
      area: entry.areaId.toString(),
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

    // Aplicar filtros
    if (startDate || endDate) {
      where.fechaSalida = {};
      if (startDate) {
        where.fechaSalida.gte = new Date(startDate);
      }
      if (endDate) {
        where.fechaSalida.lte = new Date(endDate);
      }
    }

    // TODO: Filtros deshabilitados debido a migración de schema
    // area y responsable ahora son IDs (areaId, responsableId)
    void area;
    void responsable;

    const equipment = await this.prisma.equipmentReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calcular resumen
    const totalItems = equipment.reduce((sum, item) => sum + item.cantidad, 0);
    const totalMovements = equipment.length;

    const data = equipment.map((item) => ({
      equipo: item.equipo,
      serieCodigo: item.serieCodigo,
      cantidad: item.cantidad,
      estadoEquipo: item.estadoEquipo,
      responsable: item.responsableId.toString(),
      fechaSalida: item.fechaSalida.toISOString(),
      horaSalida: undefined, // Campo eliminado del schema
      areaProyecto: `${item.areaId}-${item.projectId}`, // Combinado como texto
      firma: undefined, // Campo eliminado del schema
      fechaRetorno: item.fechaRetorno?.toISOString(),
      horaRetorno: undefined, // Campo eliminado del schema
      estadoRetorno: item.estadoRetorno ?? undefined,
      firmaRetorno: undefined, // Campo eliminado del schema
    }));

    const summary = {
      totalItems,
      totalValue: 0, // Equipment no tiene valor monetario en este contexto
      totalMovements,
      startDate,
      endDate,
    };

    return { data, summary };
  }

  async getInventoryReport(): Promise<any> {
    const products = await this.prisma.product.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        provider: true,
        location: true,
        category: true,
        unit: true,
      },
    });

    // Calcular resumen
    const totalItems = products.reduce(
      (sum, product) => sum + product.stockActual,
      0,
    );
    const totalValue = 0; // costoTotal fue eliminado del schema
    const totalProducts = products.length;

    const data = products.map((product) => ({
      codigo: product.codigo,
      descripcion: product.nombre, // Cambiado de descripcion a nombre
      costoUnitario: product.costoUnitario,
      ubicacion: product.location.nombre,
      entradas: product.entradas,
      salidas: product.salidas,
      stockActual: product.stockActual,
      unidadMedida: product.unit.nombre,
      proveedor: product.provider.nombre,
      costoTotal: 0, // Campo eliminado del schema
      categoria: product.category.nombre,
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

  // === STOCK ALERTS METHODS ===

  async getStockAlerts(filters: StockAlertFilters): Promise<StockAlert[]> {
    const where: any = {};

    // Aplicar filtros
    if (filters.categoria) {
      where.categoryId = parseInt(filters.categoria); // Now it's an ID
    }

    if (filters.ubicacion) {
      where.locationId = parseInt(filters.ubicacion); // Now it's an ID
    }

    // Obtener todos los productos
    const products = await this.prisma.product.findMany({
      where,
      orderBy: { codigo: 'asc' },
      include: {
        provider: true,
        location: true,
        category: true,
      },
    });

    // Convertir a alertas de stock
    const alerts: StockAlert[] = products.map((product) => {
      const stockMinimo = product.stockMinimo || 10; // Usar stockMinimo del producto
      let estado: 'critico' | 'bajo' | 'normal' = 'normal';

      if (product.stockActual === 0) {
        estado = 'critico';
      } else if (product.stockActual < stockMinimo) {
        estado = product.stockActual <= 3 ? 'critico' : 'bajo';
      }

      return {
        id: product.id.toString(),
        codigo: product.codigo,
        descripcion: product.nombre, // Cambiado de descripcion a nombre
        stockActual: product.stockActual,
        stockMinimo,
        ubicacion: product.location.nombre,
        categoria: product.category.nombre,
        proveedor: product.provider.nombre,
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
      include: {
        provider: true,
        location: true,
        category: true,
      },
    });

    if (!product) {
      return null;
    }

    const stockMinimo = product.stockMinimo || 10;
    let estado: 'critico' | 'bajo' | 'normal' = 'normal';

    if (product.stockActual === 0) {
      estado = 'critico';
    } else if (product.stockActual < stockMinimo) {
      estado = product.stockActual <= 3 ? 'critico' : 'bajo';
    }

    return {
      id: product.id.toString(),
      codigo: product.codigo,
      descripcion: product.nombre, // Cambiado de descripcion a nombre
      stockActual: product.stockActual,
      stockMinimo,
      ubicacion: product.location.nombre,
      categoria: product.category.nombre,
      proveedor: product.provider.nombre,
      ultimaActualizacion: product.updatedAt.toISOString().split('T')[0],
      estado,
    };
  }

  async getStockAlertStatistics(): Promise<StockAlertStatistics> {
    const products = await this.prisma.product.findMany();
    const stockMinimo = 10;

    let total = 0;
    let criticos = 0;
    let bajos = 0;
    let totalStock = 0;
    let stockMinimoTotal = 0;

    products.forEach((product) => {
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
      include: {
        product: true, // Incluir producto para obtener el código
      },
    });

    return exits.map((exit) => ({
      id: exit.id,
      fecha: exit.fecha.toISOString(),
      codigoProducto: exit.product.codigo,
      descripcion: exit.descripcion,
      precioUnitario: 0, // Campo eliminado del schema
      cantidad: exit.cantidad,
      total: 0, // No se puede calcular sin precioUnitario
      responsable: exit.responsableId.toString(),
      area: exit.areaId.toString(),
      proyecto: exit.projectId.toString(),
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
