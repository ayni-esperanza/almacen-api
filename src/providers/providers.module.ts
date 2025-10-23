import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, PrismaService],
  exports: [ProvidersService], // Open for extension by other modules
})
export class ProvidersModule {}
