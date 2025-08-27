import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../common/services/prisma.service';
import { PdfExportService } from '../common/services/pdf-export.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, PrismaService, PdfExportService],
  exports: [ReportsService],
})
export class ReportsModule {}
