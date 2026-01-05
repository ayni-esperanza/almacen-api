import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../common/services/prisma.service';
import { UploadService } from '../common/services/upload.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, PrismaService, UploadService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
