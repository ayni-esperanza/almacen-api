import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProviderDto: CreateProviderDto,
  ): Promise<ProviderResponseDto> {
    // Check if email already exists
    const existingProvider = await this.prisma.provider.findUnique({
      where: { email: createProviderDto.email },
    });

    if (existingProvider) {
      throw new ConflictException(
        `Provider with email ${createProviderDto.email} already exists`,
      );
    }

    const provider = await this.prisma.provider.create({
      data: createProviderDto,
    });

    return this.mapToResponse(provider);
  }

  async findAll(): Promise<ProviderResponseDto[]> {
    const providers = await this.prisma.provider.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return providers.map((provider) => this.mapToResponse(provider));
  }

  async findOne(id: number): Promise<ProviderResponseDto> {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return this.mapToResponse(provider);
  }

  async update(
    id: number,
    updateProviderDto: UpdateProviderDto,
  ): Promise<ProviderResponseDto> {
    await this.findOne(id); // Check if exists

    // If email is being updated, check for conflicts
    if (updateProviderDto.email) {
      const conflictingProvider = await this.prisma.provider.findUnique({
        where: { email: updateProviderDto.email },
      });

      if (conflictingProvider && conflictingProvider.id !== id) {
        throw new ConflictException(
          `Provider with email ${updateProviderDto.email} already exists`,
        );
      }
    }

    const provider = await this.prisma.provider.update({
      where: { id },
      data: updateProviderDto,
    });

    return this.mapToResponse(provider);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Check if exists

    await this.prisma.provider.delete({
      where: { id },
    });

    return { message: 'Provider deleted successfully' };
  }

  // Private helper method (DRY principle)
  private mapToResponse(provider: any): ProviderResponseDto {
    return {
      ...provider,
      photoUrl: provider.photoUrl || undefined,
    };
  }
}
