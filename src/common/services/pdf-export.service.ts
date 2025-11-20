import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfExportService {
  
  async generateStockAlertsPDF(alerts: any[], statistics: any, filters?: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
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
      
      // Footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, { align: 'right' });
      
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
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
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
      
      // Footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, { align: 'right' });
      
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
    // === GRÁFICO 1: GASTOS POR ÁREA/PROYECTO ===
    const chartTypeLabel = mainChartType === 'bar' ? 'Barras' : mainChartType === 'pie' ? 'Circular' : 'Líneas';
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text(`GASTOS POR ${filters.tipoReporte === 'area' ? 'ÁREA' : 'PROYECTO'} (Gráfico de ${chartTypeLabel})`, { align: 'center' });
    
    doc.moveDown(1);

    if (areaData && areaData.length > 0) {
      const barMaxWidth = 400;
      const barHeight = 25;
      const startX = 50;
      let currentY = doc.y;

      if (filters.tipoReporte === 'area') {
        // Mostrar datos por área
        const maxTotal = Math.max(...areaData.map(area => area.totalGasto));
        
        areaData.forEach((area) => {
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;
          }

          const barWidth = (area.totalGasto / maxTotal) * barMaxWidth;
          
          // Dibujar barra
          doc.rect(startX + 120, currentY, barWidth, barHeight)
             .fillColor('#3b82f6')
             .fill();
          
          // Nombre del área
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor('#000000')
             .text(area.area.length > 15 ? area.area.substring(0, 15) + '...' : area.area, startX, currentY + 8, { width: 110, align: 'left' });
          
          // Valor
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor('#000000')
             .text(`S/ ${area.totalGasto.toFixed(2)}`, startX + 125 + barWidth, currentY + 5, { width: 100 });
          
          // Movimientos
          doc.fontSize(7)
             .fillColor('#666666')
             .text(`(${area.cantidadMovimientos} mov.)`, startX + 125 + barWidth, currentY + 15, { width: 100 });
          
          currentY += barHeight + 5;
        });
      } else {
        // Mostrar datos por proyecto (agregados de todas las áreas)
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

        const sortedProjects = Array.from(projectData.entries())
          .sort((a, b) => b[1].totalGasto - a[1].totalGasto);

        const maxTotal = Math.max(...sortedProjects.map(([_, stats]) => stats.totalGasto));

        sortedProjects.forEach(([proyecto, stats]) => {
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;
          }

          const barWidth = (stats.totalGasto / maxTotal) * barMaxWidth;
          
          // Dibujar barra
          doc.rect(startX + 120, currentY, barWidth, barHeight)
             .fillColor('#3b82f6')
             .fill();
          
          // Nombre del proyecto
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor('#000000')
             .text(proyecto.length > 15 ? proyecto.substring(0, 15) + '...' : proyecto, startX, currentY + 8, { width: 110, align: 'left' });
          
          // Valor
          doc.fontSize(8)
             .font('Helvetica')
             .fillColor('#000000')
             .text(`S/ ${stats.totalGasto.toFixed(2)}`, startX + 125 + barWidth, currentY + 5, { width: 100 });
          
          // Movimientos
          doc.fontSize(7)
             .fillColor('#666666')
             .text(`(${stats.cantidadMovimientos} mov.)`, startX + 125 + barWidth, currentY + 15, { width: 100 });
          
          currentY += barHeight + 5;
        });
      }

      doc.y = currentY;
    }

    // === GRÁFICO 2: GASTOS MENSUALES ===
    doc.moveDown(2);
    
    const monthlyChartTypeLabel = monthlyChartType === 'bar' ? 'Barras' : monthlyChartType === 'pie' ? 'Circular' : 'Líneas';
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text(`GASTOS MENSUALES (Gráfico de ${monthlyChartTypeLabel})`, { align: 'center' });
    
    doc.moveDown(1);

    if (monthlyData && monthlyData.length > 0) {
      const barMaxWidth = 400;
      const barHeight = 25;
      const startX = 50;
      let currentY = doc.y;

      // Ordenar por mes
      const sortedMonthly = monthlyData.sort((a, b) => {
        const [monthA, yearA] = a.mes.split('/');
        const [monthB, yearB] = b.mes.split('/');
        return (parseInt(yearA) * 12 + parseInt(monthA)) - (parseInt(yearB) * 12 + parseInt(monthB));
      });

      const maxMonthlyTotal = Math.max(...sortedMonthly.map(month => month.gasto));

      sortedMonthly.forEach((month) => {
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
        }

        const barWidth = (month.gasto / maxMonthlyTotal) * barMaxWidth;
        
        // Dibujar barra
        doc.rect(startX + 80, currentY, barWidth, barHeight)
           .fillColor('#10b981')
           .fill();
        
        // Mes
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(month.mes, startX, currentY + 8, { width: 70, align: 'left' });
        
        // Valor
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`S/ ${month.gasto.toFixed(2)}`, startX + 85 + barWidth, currentY + 5, { width: 100 });
        
        // Movimientos
        doc.fontSize(7)
           .fillColor('#666666')
           .text(`(${month.movimientos} mov.)`, startX + 85 + barWidth, currentY + 15, { width: 100 });
        
        currentY += barHeight + 5;
      });

      doc.y = currentY;
    }
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
