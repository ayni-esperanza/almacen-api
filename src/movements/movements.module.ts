import { Module } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { PrismaService } from '../common/services/prisma.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [MovementsController],
  providers: [MovementsService, PrismaService],
  exports: [MovementsService],
})
export class MovementsModule {}
