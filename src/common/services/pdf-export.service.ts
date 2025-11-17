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
  
  async generateExpenseReportPDF(data: any[], filters: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#2563eb')
         .text('REPORTE DE GASTOS', { align: 'center' });
      
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
         .text(`Total Gastos: $${totalGasto.toFixed(2)}`)
         .text(`Total Movimientos: ${totalMovimientos}`);
      
      doc.moveDown(1);
      
      // Table
      let tableTop = doc.y;
      const tableLeft = 30;
      const colWidth = 60;
      const rowHeight = 20;
      
      // Function to draw table headers
      const drawExpenseHeaders = (yPos: number) => {
        const headers = ['Fecha', 'Código', 'Descripción', 'Cantidad', 'Precio', 'Total'];
        headers.forEach((header, i) => {
          doc.fontSize(8)
             .font('Helvetica-Bold')
             .fillColor('#2563eb')
             .rect(tableLeft + i * colWidth, yPos, colWidth, rowHeight)
             .fill()
             .fillColor('#ffffff')
             .text(header, tableLeft + i * colWidth + 2, yPos + 5, { width: colWidth - 4 });
        });
      };
      
      // Draw initial headers
      drawExpenseHeaders(tableTop);
      
      // Data rows
      let currentY = tableTop + rowHeight;
      
      data.forEach((item, index) => {
        // Check if we need a new page
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
          drawExpenseHeaders(currentY);
          currentY += rowHeight;
        }
        
        const rowData = [
          item.fecha,
          item.codigoProducto,
          item.descripcion?.length > 12 ? item.descripcion.substring(0, 12) + '...' : (item.descripcion || 'N/A'),
          item.cantidad.toString(),
          `$${item.precioUnitario.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ];
        
        rowData.forEach((cell, i) => {
          doc.fontSize(7)
             .font('Helvetica')
             .fillColor('#000000')
             .text(cell, tableLeft + i * colWidth + 2, currentY + 5, { width: colWidth - 4 });
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
}
