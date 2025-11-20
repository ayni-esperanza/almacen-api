import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  ExitReportResponseDto,
  ExitReportDataDto,
  ReportSummaryDto,
} from './dto/report-response.dto';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';
import { PdfExportService } from '../common/services/pdf-export.service';
import {
  StockDashboardDto,
  CriticalProductDto,
  LeastMovedProductDto,
  MostMovedProductDto,
} from './dto/stock-dashboard.dto';

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
  ocultarVistas?: boolean; // Nuevo filtro para ocultar alertas vistas
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

    // Filtrar solo productos no vistos si se solicita
    if (filters.ocultarVistas) {
      where.alertaVista = { not: true };
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

  async markAlertAsViewed(id: string): Promise<StockAlert | null> {
    // Actualizar el producto para marcar la alerta como vista
    const product = await this.prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        alertaVista: true,
        alertaVistaFecha: new Date(),
      } as any,
      include: { provider: true },
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

    if (filters.area) {
      where.area = { contains: filters.area, mode: 'insensitive' };
    }

    if (filters.proyecto) {
      where.proyecto = { contains: filters.proyecto, mode: 'insensitive' };
    }

    // Obtener movimientos de salida (gastos)
    let exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Filtrar por fechas después de obtener los datos
    if (filters.fechaInicio || filters.fechaFin) {
      exits = exits.filter((exit) => {
        try {
          // Convertir DD/MM/YYYY a Date para comparación
          const [day, month, year] = exit.fecha.split('/').map(Number);
          if (!day || !month || !year) {
            return false;
          }
          const exitDate = new Date(year, month - 1, day);

          let isInRange = true;

          if (filters.fechaInicio) {
            const [startYear, startMonth, startDay] = filters.fechaInicio.split('-').map(Number);
            const startDate = new Date(startYear, startMonth - 1, startDay || 1);
            if (exitDate < startDate) isInRange = false;
          }

          if (filters.fechaFin) {
            const [endYear, endMonth, endDay] = filters.fechaFin.split('-').map(Number);
            // Si no hay día, usar el último día del mes
            const lastDay = endDay || new Date(endYear, endMonth, 0).getDate();
            const endDate = new Date(endYear, endMonth - 1, lastDay, 23, 59, 59);
            if (exitDate > endDate) isInRange = false;
          }

          return isInRange;
        } catch (error) {
          return false;
        }
      });
    }

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

    return this.pdfExportService.generateStockAlertsPDF(alerts, statistics, filters);
  }

  async exportExpenseReportPDF(filters: any, tipo: 'chart' | 'table' = 'table', mainChartType?: 'bar' | 'pie' | 'line', monthlyChartType?: 'bar' | 'pie' | 'line'): Promise<Buffer> {
    const data = await this.getExpenseReports(filters);
    
    // Si es tipo chart, también obtener datos agrupados
    let monthlyData: any[] | null = null;
    let areaData: any[] | null = null;
    
    if (tipo === 'chart') {
      monthlyData = await this.getMonthlyExpenseData(filters);
      areaData = await this.getAreaExpenseData(filters);
    }

    return this.pdfExportService.generateExpenseReportPDF(data, filters, tipo, monthlyData, areaData, mainChartType, monthlyChartType);
  }

  /**
   * Obtiene las métricas del dashboard de stock
   * @param periodoAnalisisDias Período en días para calcular producto más movido (default: 30)
   * @returns Datos completos del dashboard de stock
   */
  async getStockDashboard(
    periodoAnalisisDias: number = 30,
  ): Promise<StockDashboardDto> {
    // Calcular total de productos en almacén (suma de stockActual)
    const totalProductos = await this.calculateTotalProducts();

    // Calcular valor total del inventario (suma de costoUnitario * stockActual)
    const valorTotalInventario = await this.calculateTotalInventoryValue();

    // Obtener producto crítico (menor stock > 0, considerando porcentaje de stock mínimo)
    const productoCritico = await this.findCriticalProduct();

    // Obtener producto menos movido (menor cantidad de movimientos de salida)
    const productoMenosMovido = await this.findLeastMovedProduct();

    // Obtener producto más movido (mayor cantidad de movimientos en el período)
    const productoMasMovido =
      await this.findMostMovedProduct(periodoAnalisisDias);

    return {
      totalProductos,
      valorTotalInventario,
      productoCritico,
      productoMenosMovido,
      productoMasMovido,
      periodoAnalisisDias,
    };
  }

  /**
   * Calcula el total de unidades en stock (suma de stockActual de todos los productos)
   * @returns Total de unidades en el almacén
   */
  private async calculateTotalProducts(): Promise<number> {
    const result = await this.prisma.product.aggregate({
      _sum: {
        stockActual: true,
      },
    });

    return result._sum.stockActual || 0;
  }

  /**
   * Calcula el valor total del inventario (suma de costoUnitario * stockActual)
   * @returns Valor monetario total del inventario
   */
  private async calculateTotalInventoryValue(): Promise<number> {
    const products = await this.prisma.product.findMany({
      select: {
        costoUnitario: true,
        stockActual: true,
      },
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + product.costoUnitario * product.stockActual;
    }, 0);

    // Redondear a 2 decimales
    return Math.round(totalValue * 100) / 100;
  }

  /**
   * Encuentra el producto crítico (menor stock > 0, considerando porcentaje de stock mínimo en empates)
   * @returns Producto con menor stock disponible o undefined si no hay productos
   */
  private async findCriticalProduct(): Promise<CriticalProductDto | undefined> {
    // Obtener productos con stock > 0
    const products = await this.prisma.product.findMany({
      where: {
        stockActual: {
          gt: 0,
        },
      },
      select: {
        codigo: true,
        nombre: true,
        stockActual: true,
        stockMinimo: true,
        ubicacion: true,
        categoria: true,
      },
    });

    if (products.length === 0) {
      return undefined;
    }

    // Encontrar el menor stock
    const minStock = Math.min(...products.map((p) => p.stockActual));

    // Filtrar productos con el menor stock
    const productsWithMinStock = products.filter(
      (p) => p.stockActual === minStock,
    );

    // Si solo hay uno con el menor stock, retornarlo
    if (productsWithMinStock.length === 1) {
      const product = productsWithMinStock[0];
      return {
        codigo: product.codigo,
        nombre: product.nombre,
        stockActual: product.stockActual,
        stockMinimo: product.stockMinimo,
        porcentajeStockMinimo:
          product.stockMinimo > 0
            ? Math.round((product.stockActual / product.stockMinimo) * 100)
            : 0,
        ubicacion: product.ubicacion,
        categoria: product.categoria || undefined,
      };
    }

    // Si hay empate, ordenar por menor porcentaje respecto al stock mínimo
    const sortedByPercentage = productsWithMinStock.sort((a, b) => {
      const percentageA =
        a.stockMinimo > 0 ? (a.stockActual / a.stockMinimo) * 100 : 0;
      const percentageB =
        b.stockMinimo > 0 ? (b.stockActual / b.stockMinimo) * 100 : 0;
      return percentageA - percentageB;
    });

    const criticalProduct = sortedByPercentage[0];

    return {
      codigo: criticalProduct.codigo,
      nombre: criticalProduct.nombre,
      stockActual: criticalProduct.stockActual,
      stockMinimo: criticalProduct.stockMinimo,
      porcentajeStockMinimo:
        criticalProduct.stockMinimo > 0
          ? Math.round(
              (criticalProduct.stockActual / criticalProduct.stockMinimo) * 100,
            )
          : 0,
      ubicacion: criticalProduct.ubicacion,
      categoria: criticalProduct.categoria || undefined,
    };
  }

  /**
   * Encuentra el producto menos movido (menor cantidad de movimientos de salida)
   * Si un producto no tiene movimientos, se considera que tiene 1
   * @returns Producto con menor cantidad de movimientos de salida o undefined si no hay productos
   */
  private async findLeastMovedProduct(): Promise<
    LeastMovedProductDto | undefined
  > {
    // Obtener todos los productos con su conteo de movimientos de salida
    const products = await this.prisma.product.findMany({
      select: {
        codigo: true,
        nombre: true,
        stockActual: true,
        ubicacion: true,
        _count: {
          select: {
            movementExits: true,
          },
        },
      },
    });

    if (products.length === 0) {
      return undefined;
    }

    // Aplicar lógica del "1 por defecto": si no tiene movimientos, se considera 1
    const productsWithMovements = products.map((product) => ({
      ...product,
      movementCount: product._count.movementExits || 1,
    }));

    // Encontrar el menor número de movimientos
    const minMovements = Math.min(
      ...productsWithMovements.map((p) => p.movementCount),
    );

    // Encontrar el primer producto con el menor número de movimientos
    const leastMovedProduct = productsWithMovements.find(
      (p) => p.movementCount === minMovements,
    );

    if (!leastMovedProduct) {
      return undefined;
    }

    return {
      codigo: leastMovedProduct.codigo,
      nombre: leastMovedProduct.nombre,
      cantidadMovimientos: leastMovedProduct.movementCount,
      stockActual: leastMovedProduct.stockActual,
      ubicacion: leastMovedProduct.ubicacion,
    };
  }

  /**
   * Encuentra el producto más movido (mayor cantidad de movimientos de salida en el período)
   * @param periodoAnalisisDias Período en días para analizar movimientos (default: 30)
   * @returns Producto con mayor cantidad de movimientos de salida o undefined si no hay productos
   */
  private async findMostMovedProduct(
    periodoAnalisisDias: number = 30,
  ): Promise<MostMovedProductDto | undefined> {
    // Calcular la fecha de inicio del período (periodoAnalisisDias días atrás desde hoy)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodoAnalisisDias);
    const startDateString = this.formatDateToDDMMYYYY(startDate);

    // Agrupar movimientos de salida por producto dentro del período
    const exitsByProduct = await this.prisma.movementExit.groupBy({
      by: ['codigoProducto'],
      where: {
        fecha: {
          gte: startDateString,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        cantidad: true,
      },
    });

    if (exitsByProduct.length === 0) {
      return undefined;
    }

    // Encontrar el producto con mayor cantidad de movimientos
    const maxMovements = Math.max(...exitsByProduct.map((p) => p._count.id));

    const mostMovedProductData = exitsByProduct.find(
      (p) => p._count.id === maxMovements,
    );

    if (!mostMovedProductData) {
      return undefined;
    }

    // Obtener datos completos del producto
    const product = await this.prisma.product.findUnique({
      where: {
        codigo: mostMovedProductData.codigoProducto,
      },
      select: {
        codigo: true,
        nombre: true,
        stockActual: true,
      },
    });

    if (!product) {
      return undefined;
    }

    return {
      codigo: product.codigo,
      nombre: product.nombre,
      cantidadMovimientos: mostMovedProductData._count.id,
      unidadesTotalesSalidas: mostMovedProductData._sum.cantidad || 0,
      stockActual: product.stockActual,
      periodo: `${periodoAnalisisDias} días`,
    };
  }

  /**
   * Formatea una fecha a formato DD/MM/YYYY
   * @param date Fecha a formatear
   * @returns Fecha en formato DD/MM/YYYY
   */
  private formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
