import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfExportService {
  
  async generateStockAlertsPDF(alerts: any[], statistics: any): Promise<Buffer> {
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
      
      doc.moveDown(0.5);
      
      // Subtitle
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Productos con stock por debajo del mínimo (10 unidades)', { align: 'center' });
      
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
      
      doc.moveDown(1);
      
      // Table header
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('PRODUCTOS CON STOCK BAJO');
      
      doc.moveDown(0.5);
      
      // Table
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidth = 70;
      const rowHeight = 20;
      
      // Headers
      const headers = ['Estado', 'Código', 'Descripción', 'Stock', 'Mínimo', 'Ubicación'];
      headers.forEach((header, i) => {
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .rect(tableLeft + i * colWidth, tableTop, colWidth, rowHeight)
           .fill()
           .fillColor('#000000')
           .text(header, tableLeft + i * colWidth + 2, tableTop + 5, { width: colWidth - 4 });
      });
      
      // Data rows
      alerts.forEach((alert, index) => {
        const y = tableTop + (index + 1) * rowHeight;
        
        if (y > doc.page.height - 100) {
          doc.addPage();
          doc.y = 50;
        }
        
        const rowData = [
          alert.estado.toUpperCase(),
          alert.codigo,
          alert.descripcion.length > 15 ? alert.descripcion.substring(0, 15) + '...' : alert.descripcion,
          alert.stockActual.toString(),
          alert.stockMinimo.toString(),
          alert.ubicacion
        ];
        
        rowData.forEach((cell, i) => {
          doc.fontSize(7)
             .font('Helvetica')
             .fillColor('#000000')
             .text(cell, tableLeft + i * colWidth + 2, y + 5, { width: colWidth - 4 });
        });
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
      const tableTop = doc.y;
      const tableLeft = 30;
      const colWidth = 60;
      const rowHeight = 20;
      
      // Headers
      const headers = ['Fecha', 'Código', 'Descripción', 'Cantidad', 'Precio', 'Total'];
      headers.forEach((header, i) => {
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .rect(tableLeft + i * colWidth, tableTop, colWidth, rowHeight)
           .fill()
           .fillColor('#000000')
           .text(header, tableLeft + i * colWidth + 2, tableTop + 5, { width: colWidth - 4 });
      });
      
      // Data rows
      data.forEach((item, index) => {
        const y = tableTop + (index + 1) * rowHeight;
        
        if (y > doc.page.height - 100) {
          doc.addPage();
          doc.y = 50;
        }
        
        const rowData = [
          item.fecha,
          item.codigoProducto,
          item.descripcion.length > 12 ? item.descripcion.substring(0, 12) + '...' : item.descripcion,
          item.cantidad.toString(),
          `$${item.precioUnitario.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ];
        
        rowData.forEach((cell, i) => {
          doc.fontSize(7)
             .font('Helvetica')
             .fillColor('#000000')
             .text(cell, tableLeft + i * colWidth + 2, y + 5, { width: colWidth - 4 });
        });
      });
      
      // Footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, { align: 'right' });
      
      doc.end();
    });
  }
}
