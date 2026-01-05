import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { UploadService } from '../common/services/upload.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createProviderDto: CreateProviderDto,
  ): Promise<ProviderResponseDto> {
    // Verificar si el email ya existe (y está activo)
    // findUnique busca en toda la tabla, incluso borrados,
    // pero como renombramos el email al borrar, findUnique es seguro.
    const existingProvider = await this.prisma.provider.findUnique({
      where: { email: createProviderDto.email },
    });

    if (existingProvider) {
      throw new ConflictException(
        `Provider with email ${createProviderDto.email} already exists`,
      );
    }

    // Manejar foto si viene en Base64
    let photoUrl = createProviderDto.photoUrl;
    if (photoUrl && this.uploadService.isBase64(photoUrl)) {
      try {
        photoUrl = await this.uploadService.uploadImageFromBase64(
          photoUrl,
          'providers',
        );
      } catch (error) {
        // Si falla la subida, continuar sin foto pero registrar el error
        console.error('Error uploading provider photo:', error.message);
        photoUrl = null;
      }
    }

    const provider = await this.prisma.provider.create({
      data: {
        ...createProviderDto,
        photoUrl,
      },
    });

    return this.mapToResponse(provider);
  }

  async findAll(): Promise<ProviderResponseDto[]> {
    const providers = await this.prisma.provider.findMany({
      where: { deletedAt: null }, // Solo activos
      orderBy: { createdAt: 'desc' },
    });

    return providers.map((provider) => this.mapToResponse(provider));
  }

  async findOne(id: number): Promise<ProviderResponseDto> {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id,
        deletedAt: null, // Solo activos
      },
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
    const existingProvider = await this.findOne(id); // Valida existencia y estado activo

    // Si se actualiza el email, verificar conflictos
    if (updateProviderDto.email) {
      const conflictingProvider = await this.prisma.provider.findUnique({
        where: { email: updateProviderDto.email },
      });

      // Conflicto solo si existe y es otro usuario
      if (conflictingProvider && conflictingProvider.id !== id) {
        throw new ConflictException(
          `Provider with email ${updateProviderDto.email} already exists`,
        );
      }
    }

    // Manejar foto si viene en Base64
    const updateData = { ...updateProviderDto };
    if (
      updateProviderDto.photoUrl &&
      this.uploadService.isBase64(updateProviderDto.photoUrl)
    ) {
      try {
        // Subir nueva imagen
        const newPhotoUrl = await this.uploadService.uploadImageFromBase64(
          updateProviderDto.photoUrl,
          'providers',
        );

        // Eliminar foto anterior si existe y es una URL de R2
        if (existingProvider.photoUrl) {
          await this.uploadService.deleteImage(existingProvider.photoUrl);
        }

        updateData.photoUrl = newPhotoUrl;
      } catch (error) {
        // Si falla la subida, continuar sin actualizar foto pero registrar el error
        console.error('Error uploading provider photo:', error.message);
        delete updateData.photoUrl;
      }
    }

    const provider = await this.prisma.provider.update({
      where: { id },
      data: updateData,
    });

    return this.mapToResponse(provider);
  }

  async remove(id: number): Promise<{ message: string }> {
    const provider = await this.findOne(id); // Obtener datos actuales

    // Generar email de archivo para liberar el UNIQUE constraint
    const timestamp = new Date().getTime();
    const archivedEmail = `${provider.email}_deleted_${timestamp}`;

    await this.prisma.provider.update({
      where: { id },
      data: {
        deletedAt: new Date(), // Marcar como borrado
        email: archivedEmail, // Liberar el email original
      },
    });

    return { message: 'Provider deleted successfully' };
  }

  private mapToResponse(provider: any): ProviderResponseDto {
    return {
      ...provider,
      photoUrl: provider.photoUrl || undefined,
    };
  }
}
