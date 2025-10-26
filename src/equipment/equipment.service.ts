import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ReturnEquipmentDto } from './dto/return-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';

@Injectable()
export class EquipmentService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    // Verify product exists and has enough stock
    const product = await this.inventoryService.findByCode(
      createEquipmentDto.serieCodigo,
    );

    if (product.stockActual < createEquipmentDto.cantidad) {
      throw new NotFoundException(
        `Insufficient stock. Available: ${product.stockActual}, Requested: ${createEquipmentDto.cantidad}`,
      );
    }

    // Create equipment report
    const equipment = await this.prisma.equipmentReport.create({
      data: {
        ...createEquipmentDto,
        // Map enum values to match Prisma enum
        estadoEquipo: this.mapEstadoEquipo(createEquipmentDto.estadoEquipo),
      },
    });

    // Update product stock (reduce it)
    await this.inventoryService.updateStock(
      createEquipmentDto.serieCodigo,
      0,
      createEquipmentDto.cantidad,
    );

    return this.mapToResponse(equipment);
  }

  async findAll(search?: string): Promise<EquipmentResponseDto[]> {
    const where = search
      ? {
          OR: [
            { equipo: { contains: search, mode: 'insensitive' as const } },
            { serieCodigo: { contains: search, mode: 'insensitive' as const } },
            { responsable: { contains: search, mode: 'insensitive' as const } },
            {
              areaProyecto: { contains: search, mode: 'insensitive' as const },
            },
          ],
        }
      : {};

    const equipment = await this.prisma.equipmentReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return equipment.map((item) => this.mapToResponse(item));
  }

  async findOne(id: number): Promise<EquipmentResponseDto> {
    const equipment = await this.prisma.equipmentReport.findUnique({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return this.mapToResponse(equipment);
  }

  async findByCode(serieCodigo: string): Promise<EquipmentResponseDto | null> {
    // Find the most recent equipment report with this code
    const equipment = await this.prisma.equipmentReport.findFirst({
      where: { serieCodigo },
      orderBy: { createdAt: 'desc' },
    });

    if (!equipment) {
      return null;
    }

    return this.mapToResponse(equipment);
  }

  async update(
    id: number,
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    await this.findOne(id); // Check if exists

    const updateData: any = { ...updateEquipmentDto };
    if (updateEquipmentDto.estadoEquipo) {
      updateData.estadoEquipo = this.mapEstadoEquipo(
        updateEquipmentDto.estadoEquipo,
      );
    }

    const equipment = await this.prisma.equipmentReport.update({
      where: { id },
      data: updateData,
    });

    return this.mapToResponse(equipment);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Check if exists

    await this.prisma.equipmentReport.delete({
      where: { id },
    });

    return { message: 'Equipment deleted successfully' };
  }

  async registerReturn(
    id: number,
    returnEquipmentDto: ReturnEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    await this.findOne(id); // Check if exists

    const equipment = await this.prisma.equipmentReport.update({
      where: { id },
      data: {
        fechaRetorno: returnEquipmentDto.fechaRetorno,
        horaRetorno: returnEquipmentDto.horaRetorno,
        estadoRetorno: this.mapEstadoEquipo(returnEquipmentDto.estadoRetorno),
        responsableRetorno: returnEquipmentDto.responsableRetorno,
      },
    });

    return this.mapToResponse(equipment);
  }

  // Helper method to map Prisma entity to response DTO
  private mapToResponse(equipment: any): EquipmentResponseDto {
    return {
      id: equipment.id,
      equipo: equipment.equipo,
      serieCodigo: equipment.serieCodigo,
      cantidad: equipment.cantidad,
      estadoEquipo: this.mapEstadoEquipoToFrontend(equipment.estadoEquipo),
      responsable: equipment.responsable,
      fechaSalida: equipment.fechaSalida,
      horaSalida: equipment.horaSalida,
      areaProyecto: equipment.areaProyecto,
      firma: equipment.firma,
      fechaRetorno: equipment.fechaRetorno || undefined,
      horaRetorno: equipment.horaRetorno || undefined,
      estadoRetorno: equipment.estadoRetorno
        ? this.mapEstadoEquipoToFrontend(equipment.estadoRetorno)
        : undefined,
      firmaRetorno: equipment.firmaRetorno || undefined,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt,
    };
  }

  // Helper methods to map between frontend and Prisma enum formats
  private mapEstadoEquipo(estado: string): any {
    const mapping = {
      Bueno: 'Bueno',
      Regular: 'Regular',
      Malo: 'Malo',
      'En Reparación': 'En_Reparacion',
      Dañado: 'Danado',
    };
    return mapping[estado] || estado;
  }

  private mapEstadoEquipoToFrontend(estado: any): string {
    const mapping = {
      Bueno: 'Bueno',
      Regular: 'Regular',
      Malo: 'Malo',
      En_Reparacion: 'En Reparación',
      Danado: 'Dañado',
    };
    return mapping[estado] || estado;
  }
}
