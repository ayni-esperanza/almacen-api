import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

type PdfChartDataPoint = { name: string; value: number; movements: number };
interface LimitedChartData {
  data: PdfChartDataPoint[];
  truncated: boolean;
  omittedCount?: number;
}

@Injectable()
export class PdfExportService {
  private readonly MAX_CHART_ITEMS = 12;
  private readonly MAX_MONTH_POINTS = 15;
  
  async generateStockAlertsPDF(alerts: any[], statistics: any, filters?: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ bufferPages: true });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#f56565')
         .text('ALERTAS DE STOCK', { align: 'center' });
      
      doc.moveDown(1);
      
      // Statistics
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('ESTADÍSTICAS');
      
      doc.moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Total Alertas: ${statistics.total}`)
         .text(`Críticos: ${statistics.criticos}`)
         .text(`Bajos: ${statistics.bajos}`)
         .text(`Stock Actual: ${statistics.totalStock}`)
         .text(`Stock Mínimo: ${statistics.stockMinimo}`);
      
      doc.moveDown(0.5);
      
      // Subtitle dinámico basado en filtros (después de estadísticas)
      const parts: string[] = ['Productos con Stock'];
      
      if (filters?.estado) {
        const estadoTexto = filters.estado === 'critico' ? 'Crítico' : filters.estado === 'bajo' ? 'Bajo' : 'Normal';
        parts.push(estadoTexto);
      }
      
      if (filters?.categoria) {
        parts.push(`Categoría: ${filters.categoria}`);
      }
      
      if (filters?.ubicacion) {
        parts.push(`Ubicación: ${filters.ubicacion}`);
      }
      
      const subtitulo = parts.join(' • ');
      
      doc.moveDown(1);
      
      // Table header con título dinámico
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(subtitulo.toUpperCase());
      
      doc.moveDown(0.5);
      
      // Table
      let tableTop = doc.y;
      const colWidth = 80;
      const rowHeight = 20;
      const numColumns = 6;
      const tableWidth = colWidth * numColumns;
      const tableLeft = (doc.page.width - tableWidth) / 2; // Centrar la tabla
      
      // Function to draw table headers
      const drawHeaders = (yPos: number) => {
        const headers = ['Estado', 'Código', 'Descripción', 'Stock', 'Mínimo', 'Ubicación'];
        headers.forEach((header, i) => {
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor('#f97316') // Color anaranjado
             .rect(tableLeft + i * colWidth, yPos, colWidth, rowHeight)
             .fill()
             .fillColor('#ffffff')
             .text(header, tableLeft + i * colWidth + 5, yPos + 6, { 
               width: colWidth - 10,
               align: 'center'
             });
        });
      };
      
      // Draw initial headers
      drawHeaders(tableTop);
      
      // Data rows
      let currentY = tableTop + rowHeight;
      
      alerts.forEach((alert, index) => {
        // Check if we need a new page
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
          drawHeaders(currentY);
          currentY += rowHeight;
        }
        
        const rowData = [
          alert.estado.toUpperCase(),
          alert.codigo,
          alert.nombre?.length > 20 ? alert.nombre.substring(0, 20) + '...' : (alert.nombre || 'N/A'),
          alert.stockActual.toString(),
          alert.stockMinimo.toString(),
          alert.ubicacion || 'N/A'
        ];
        
        // Dibujar fondo alternado para las filas
        if (index % 2 === 0) {
          doc.fillColor('#f9fafb')
             .rect(tableLeft, currentY, tableWidth, rowHeight)
             .fill();
        }
        
        rowData.forEach((cell, i) => {
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor('#000000')
             .text(cell, tableLeft + i * colWidth + 5, currentY + 6, { 
               width: colWidth - 10,
               align: i === 0 ? 'center' : 'left'
             });
        });
        
        currentY += rowHeight;
      });
      
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        // Se omite el pie de página para evitar páginas en blanco
      }

      doc.end();
    });
  }
  
  async generateExpenseReportPDF(
    data: any[], 
    filters: any, 
    tipo: 'chart' | 'table' = 'table',
    monthlyData: any[] | null = null,
    areaData: any[] | null = null,
    mainChartType: 'bar' | 'pie' | 'line' = 'bar',
    monthlyChartType: 'bar' | 'pie' | 'line' = 'bar'
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ 
        autoFirstPage: false,
        bufferPages: true
      });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Crear primera página
      doc.addPage();
      
      // Header
      const titulo = tipo === 'chart' ? 'REPORTE DE GASTOS - GRÁFICOS' : 'REPORTE DE GASTOS - TABLA';
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#2563eb')
         .text(titulo, { align: 'center' });
      
      doc.moveDown(0.5);
      
      // Filters info
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Período: ${filters.fechaInicio || 'N/A'} - ${filters.fechaFin || 'N/A'}`, { align: 'center' });
      
      if (filters.area) {
        doc.text(`Área: ${filters.area}`, { align: 'center' });
      }
      
      if (filters.proyecto) {
        doc.text(`Proyecto: ${filters.proyecto}`, { align: 'center' });
      }
      
      doc.moveDown(1);
      
      // Summary
      const totalGasto = data.reduce((sum, item) => sum + item.total, 0);
      const totalMovimientos = data.length;
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('RESUMEN');
      
      doc.moveDown(0.5);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Total Gastos: S/ ${totalGasto.toFixed(2)}`)
         .text(`Total Movimientos: ${totalMovimientos}`);
      
      doc.moveDown(1);
      
      if (tipo === 'chart') {
        // Generar vista de gráficos (usando datos pre-agrupados)
        this.generateChartView(doc, filters, monthlyData, areaData, mainChartType, monthlyChartType);
      } else {
        // Generar tabla tradicional
        this.generateTableView(doc, data);
      }
      
      // Footer en la última página
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        // Se omite el pie de página para evitar páginas en blanco
      }
      
      doc.end();
    });
  }

  private generateChartView(
    doc: any, 
    filters: any, 
    monthlyData: any[] | null, 
    areaData: any[] | null,
    mainChartType: 'bar' | 'pie' | 'line' = 'bar',
    monthlyChartType: 'bar' | 'pie' | 'line' = 'bar'
  ) {
    let hasRenderedFirstChart = false;
    
    // === GRÁFICO 1: GASTOS POR ÁREA/PROYECTO ===
    if (areaData && areaData.length > 0) {
      hasRenderedFirstChart = true;
      
      const chartTypeLabel = mainChartType === 'bar' ? 'Barras' : mainChartType === 'pie' ? 'Circular' : 'Líneas';
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#2563eb')
         .text(`GASTOS POR ${filters.tipoReporte === 'area' ? 'ÁREA' : 'PROYECTO'} (Gráfico de ${chartTypeLabel})`, { align: 'center' });
      
      doc.moveDown(1);

      // Preparar datos según el tipo de reporte
      let chartData: Array<{ name: string; value: number; movements: number }> = [];
      
      if (filters.tipoReporte === 'area') {
        chartData = areaData.map(area => ({
          name: area.area,
          value: area.totalGasto,
          movements: area.cantidadMovimientos
        }));
      } else {
        const projectData = new Map<string, { totalGasto: number; cantidadMovimientos: number }>();
        
        areaData.forEach(area => {
          area.proyectos.forEach((proyecto: any) => {
            const existing = projectData.get(proyecto.proyecto) || { totalGasto: 0, cantidadMovimientos: 0 };
            projectData.set(proyecto.proyecto, {
              totalGasto: existing.totalGasto + proyecto.totalGasto,
              cantidadMovimientos: existing.cantidadMovimientos + proyecto.cantidadMovimientos
            });
          });
        });

        chartData = Array.from(projectData.entries())
          .sort((a, b) => b[1].totalGasto - a[1].totalGasto)
          .map(([name, stats]) => ({
            name,
            value: stats.totalGasto,
            movements: stats.cantidadMovimientos
          }));
      }

      const { data: limitedChartData, truncated: mainChartTruncated } = this.limitChartItems(chartData, this.MAX_CHART_ITEMS);

      if (limitedChartData.length === 0) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text('Sin datos suficientes para generar el gráfico.');
      } else {
        // Renderizar según el tipo de gráfico
        if (mainChartType === 'pie') {
          this.renderPieChart(doc, limitedChartData, '#3b82f6');
        } else if (mainChartType === 'line') {
          this.renderLineChart(doc, limitedChartData, '#3b82f6');
        } else {
          this.renderBarChart(doc, limitedChartData, '#3b82f6', 50, 120);
        }

        if (mainChartTruncated) {
          const visibleCount = Math.max(1, this.MAX_CHART_ITEMS - 1);
          this.renderTruncationNote(
            doc,
            `Nota: Se muestran las ${visibleCount} categorías con mayor gasto y el resto se agrupa en "Otros" para mantener el gráfico en una sola página.`
          );
        }
      }
    }

    // === GRÁFICO 2: GASTOS MENSUALES ===
    if (monthlyData && monthlyData.length > 0) {
      // Si ya renderizamos el primer gráfico, verificar si necesitamos nueva página
      if (hasRenderedFirstChart) {
        const estimatedHeight = monthlyChartType === 'pie' ? 400 : monthlyChartType === 'line' ? 400 : (Math.min(monthlyData.length, 10) * 30 + 150);
        
        // Verificar espacio disponible
        if (doc.y + estimatedHeight > doc.page.height - 80) {
          doc.addPage();
        } else {
          doc.moveDown(2);
        }
      }
      
      const monthlyChartTypeLabel = monthlyChartType === 'bar' ? 'Barras' : monthlyChartType === 'pie' ? 'Circular' : 'Líneas';
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#2563eb')
         .text(`GASTOS MENSUALES (Gráfico de ${monthlyChartTypeLabel})`, { align: 'center' });
      
      doc.moveDown(1);

      // Ordenar por mes
      const sortedMonthly = monthlyData.sort((a, b) => {
        const [monthA, yearA] = a.mes.split('/');
        const [monthB, yearB] = b.mes.split('/');
        return (parseInt(yearA) * 12 + parseInt(monthA)) - (parseInt(yearB) * 12 + parseInt(monthB));
      });

      const monthlyChartData = sortedMonthly.map(month => ({
        name: month.mes,
        value: month.gasto,
        movements: month.movimientos
      }));

      const { data: limitedMonthlyData, truncated: monthlyTruncated, omittedCount } = this.limitMonthlySeries(monthlyChartData, this.MAX_MONTH_POINTS);

      if (limitedMonthlyData.length === 0) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text('Sin datos suficientes para generar el gráfico.');
      } else {
        // Renderizar según el tipo de gráfico
        if (monthlyChartType === 'pie') {
          this.renderPieChart(doc, limitedMonthlyData, '#10b981');
        } else if (monthlyChartType === 'line') {
          this.renderLineChart(doc, limitedMonthlyData, '#10b981');
        } else {
          this.renderBarChart(doc, limitedMonthlyData, '#10b981', 50, 80);
        }

        if (monthlyTruncated) {
          const omitted = omittedCount || 0;
          this.renderTruncationNote(
            doc,
            `Nota: Se muestran los últimos ${this.MAX_MONTH_POINTS} meses del periodo${omitted > 0 ? ` (se omitieron ${omitted} meses iniciales)` : ''} para mantener el gráfico en una sola página.`
          );
        }
      }
    }
  }

  private renderBarChart(doc: any, data: Array<{ name: string; value: number; movements: number }>, color: string, startX: number, labelWidth: number) {
    const barMaxWidth = 400;
    const barHeight = 25;
    let currentY = doc.y;
    const rawMax = data.length ? Math.max(...data.map(item => item.value)) : 0;
    const maxValue = rawMax <= 0 ? 1 : rawMax;

    data.forEach((item, index) => {
      // Solo crear nueva página si realmente no cabe este elemento
      const neededSpace = barHeight + 5;
      if (currentY + neededSpace > doc.page.height - 80) {
        doc.addPage();
        currentY = 50;
      }

      const barWidth = (item.value / maxValue) * barMaxWidth;
      
      // Dibujar barra
      doc.rect(startX + labelWidth, currentY, barWidth, barHeight)
         .fillColor(color)
         .fill();
      
      // Nombre
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name, startX, currentY + 8, { width: labelWidth - 10, align: 'left' });
      
      // Valor
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`S/ ${item.value.toFixed(2)}`, startX + labelWidth + barWidth + 5, currentY + 5, { width: 100 });
      
      // Movimientos
      doc.fontSize(7)
         .fillColor('#666666')
         .text(`(${item.movements} mov.)`, startX + labelWidth + barWidth + 5, currentY + 15, { width: 100 });
      
      currentY += barHeight + 5;
    });

    doc.y = currentY;
  }

  private renderPieChart(doc: any, data: Array<{ name: string; value: number; movements: number }>, baseColor: string) {
    if (!data || data.length === 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Sin datos disponibles para mostrar.');
      doc.moveDown(1);
      return;
    }

    const radius = 100;
    const legendItemHeight = 15;
    const totalLegendHeight = data.length * legendItemHeight;
    const chartDiameter = radius * 2;
    const spacingAbove = 30;
    const spacingBelow = 40;
    const totalRequired = chartDiameter + totalLegendHeight + spacingAbove + spacingBelow;

    // Verificar espacio disponible y crear nueva página solo si es absolutamente necesario
    const availableSpace = doc.page.height - doc.y - 60; // 60px margen inferior
    if (availableSpace < totalRequired) {
      doc.addPage();
    }
    
    const centerX = doc.page.width / 2;
    const centerY = doc.y + radius + spacingAbove;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Sin valores disponibles para graficar.');
      doc.moveDown(1);
      return;
    }
    const basePalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    const colors = [baseColor, ...basePalette].filter(
      (color, index, array) => color && array.indexOf(color) === index
    );
    
    let currentAngle = -Math.PI / 2;
    
    // Dibujar cada segmento del pie
    data.forEach((item, index) => {
      const percentage = item.value / total;
      const sliceAngle = percentage * 2 * Math.PI;
      const color = colors[index % colors.length];
      
      doc.moveTo(centerX, centerY);
      doc.lineTo(centerX + radius * Math.cos(currentAngle), centerY + radius * Math.sin(currentAngle));
      
      const steps = Math.max(10, Math.floor(sliceAngle * 20));
      for (let i = 0; i <= steps; i++) {
        const angle = currentAngle + (sliceAngle * i / steps);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        doc.lineTo(x, y);
      }
      
      doc.lineTo(centerX, centerY);
      doc.fillColor(color).fill();
      
      currentAngle += sliceAngle;
    });
    
    // Leyenda
    let legendY = centerY + radius + 25;
    const legendX = 50;
    
    data.forEach((item, index) => {
      const color = colors[index % colors.length];
      const percentage = ((item.value / total) * 100).toFixed(1);
      
      doc.rect(legendX, legendY - 8, 10, 10)
         .fillColor(color)
         .fill();
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`${item.name}: S/ ${item.value.toFixed(2)} (${percentage}%) - ${item.movements} mov.`, legendX + 15, legendY - 5, { width: 500 });
      
      legendY += legendItemHeight;
    });
    
    doc.y = legendY + 5;
  }

  private renderLineChart(doc: any, data: Array<{ name: string; value: number; movements: number }>, color: string) {
    const chartWidth = 450;
    const chartHeight = 200;
    const legendItemHeight = 12;
    const totalLegendHeight = data.length * legendItemHeight;
    const axisLabelSpace = 60;
    const totalRequired = chartHeight + axisLabelSpace + totalLegendHeight + 40;
    
    // Verificar espacio disponible
    const availableSpace = doc.page.height - doc.y - 60;
    if (availableSpace < totalRequired) {
      doc.addPage();
    }
    
    const startX = 80;
    const startY = doc.y + 20;
    const rawMax = data.length ? Math.max(...data.map(item => item.value)) : 0;
    const maxValue = rawMax <= 0 ? 1 : rawMax;
    const step = chartWidth / (data.length - 1 || 1);
    
    // Dibujar ejes
    doc.strokeColor('#666666')
       .lineWidth(1)
       .moveTo(startX, startY)
      .lineTo(startX, startY + chartHeight)
      .lineTo(startX + chartWidth, startY + chartHeight)
    
    // Dibujar líneas de la gráfica
    doc.strokeColor(color)
       .lineWidth(2);
    
    data.forEach((item, index) => {
      const x = startX + (index * step);
      const y = startY + chartHeight - ((item.value / maxValue) * chartHeight);
      
      if (index === 0) {
        doc.moveTo(x, y);
      } else {
        doc.lineTo(x, y);
      }
    });
    
    doc.stroke();
    
    // Dibujar puntos
    data.forEach((item, index) => {
      const x = startX + (index * step);
      const y = startY + chartHeight - ((item.value / maxValue) * chartHeight);
      
      doc.circle(x, y, 4)
         .fillColor(color)
         .fill();
    });
    
    // Etiquetas del eje X (nombres)
    doc.fontSize(7)
       .fillColor('#666666');
    
    data.forEach((item, index) => {
      const x = startX + (index * step);
      doc.save();
      doc.translate(x, startY + chartHeight + 5);
      doc.rotate(-45);
      doc.text(item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name, 0, 0);
      doc.restore();
    });
    
    // Valores y leyenda
    let legendY = startY + chartHeight + 45;
    const legendX = 50;
    
    doc.fontSize(8)
       .fillColor('#000000');
    
    data.forEach((item) => {
      doc.text(`${item.name}: S/ ${item.value.toFixed(2)} (${item.movements} mov.)`, legendX, legendY, { width: 500 });
      legendY += legendItemHeight;
    });
    
    doc.y = legendY + 5;
  }

  private limitChartItems(items: PdfChartDataPoint[] = [], maxItems?: number): LimitedChartData {
    const limit = maxItems ?? this.MAX_CHART_ITEMS;
    if (!items || items.length <= limit) {
      return { data: items ?? [], truncated: false };
    }

    const safeLimit = Math.max(2, limit);
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const kept = sorted.slice(0, safeLimit - 1);
    const remainder = sorted.slice(safeLimit - 1).reduce(
      (acc, item) => {
        acc.value += item.value;
        acc.movements += item.movements;
        return acc;
      },
      { name: 'Otros', value: 0, movements: 0 }
    );

    if (remainder.value > 0 || remainder.movements > 0) {
      kept.push(remainder);
    }

    return { data: kept, truncated: true };
  }

  private limitMonthlySeries(items: PdfChartDataPoint[] = [], maxItems?: number): LimitedChartData {
    const limit = maxItems ?? this.MAX_MONTH_POINTS;
    if (!items || items.length <= limit) {
      return { data: items ?? [], truncated: false };
    }

    const sliceStart = items.length - limit;
    return {
      data: items.slice(sliceStart),
      truncated: true,
      omittedCount: sliceStart,
    };
  }

  private renderTruncationNote(doc: any, message: string) {
    doc.moveDown(0.35);
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text(message, { align: 'center' });
    doc.moveDown(0.4);
  }

  private generateTableView(doc: any, data: any[]) {
    // Configuración de la tabla
    const pageWidth = doc.page.width;
    const margins = 40;
    const tableWidth = pageWidth - (margins * 2);
    
    // Anchos de columnas ajustados proporcionalmente
    const colWidths = {
      fecha: tableWidth * 0.12,      // 12%
      codigo: tableWidth * 0.13,     // 13%
      descripcion: tableWidth * 0.30, // 30%
      cantidad: tableWidth * 0.10,   // 10%
      precio: tableWidth * 0.17,     // 17%
      total: tableWidth * 0.18       // 18%
    };
    
    let tableTop = doc.y;
    const tableLeft = margins;
    const rowHeight = 25;
    
    // Function to draw table headers
    const drawExpenseHeaders = (yPos: number) => {
      const headers = [
        { text: 'Fecha', width: colWidths.fecha },
        { text: 'Código', width: colWidths.codigo },
        { text: 'Descripción', width: colWidths.descripcion },
        { text: 'Cant.', width: colWidths.cantidad },
        { text: 'Precio Unit.', width: colWidths.precio },
        { text: 'Total', width: colWidths.total }
      ];
      
      let currentX = tableLeft;
      
      headers.forEach((header) => {
        // Fondo del encabezado
        doc.rect(currentX, yPos, header.width, rowHeight)
           .fillColor('#2563eb')
           .fill();
        
        // Texto del encabezado
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text(header.text, currentX + 5, yPos + 8, { 
             width: header.width - 10, 
             align: 'center' 
           });
        
        currentX += header.width;
      });
    };
    
    // Draw initial headers
    drawExpenseHeaders(tableTop);
    
    // Data rows
    let currentY = tableTop + rowHeight;
    let rowIndex = 0;
    
    data.forEach((item) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 80) {
        doc.addPage();
        currentY = 50;
        drawExpenseHeaders(currentY);
        currentY += rowHeight;
        rowIndex = 0;
      }
      
      // Alternar color de fondo para filas
      if (rowIndex % 2 === 0) {
        doc.rect(tableLeft, currentY, tableWidth, rowHeight)
           .fillColor('#f9fafb')
           .fill();
      }
      
      const rowData = [
        { text: item.fecha || '', width: colWidths.fecha, align: 'center' },
        { text: item.codigoProducto || '', width: colWidths.codigo, align: 'left' },
        { text: item.descripcion?.length > 35 ? item.descripcion.substring(0, 35) + '...' : (item.descripcion || 'N/A'), width: colWidths.descripcion, align: 'left' },
        { text: item.cantidad?.toString() || '0', width: colWidths.cantidad, align: 'center' },
        { text: `S/ ${(item.precioUnitario || 0).toFixed(2)}`, width: colWidths.precio, align: 'right' },
        { text: `S/ ${(item.total || 0).toFixed(2)}`, width: colWidths.total, align: 'right' }
      ];
      
      let currentX = tableLeft;
      
      rowData.forEach((cell) => {
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#000000')
           .text(cell.text, currentX + 5, currentY + 8, { 
             width: cell.width - 10, 
             align: cell.align as any
           });
        
        currentX += cell.width;
      });
      
      // Línea divisoria
      doc.strokeColor('#e5e7eb')
         .lineWidth(0.5)
         .moveTo(tableLeft, currentY + rowHeight)
         .lineTo(tableLeft + tableWidth, currentY + rowHeight)
         .stroke();
      
      currentY += rowHeight;
      rowIndex++;
    });
    
    doc.y = currentY;
  }
}
