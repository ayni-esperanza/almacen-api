import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ReturnEquipmentDto } from './dto/return-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const equipment = await this.prisma.equipmentReport.create({
      data: {
        equipo: createEquipmentDto.equipo,
        serieCodigo: createEquipmentDto.serieCodigo,
        cantidad: createEquipmentDto.cantidad,
        estadoEquipo: createEquipmentDto.estadoEquipo,
        responsableId: createEquipmentDto.responsableId,
        fechaSalida: new Date(createEquipmentDto.fechaSalida),
        areaId: createEquipmentDto.areaId,
        projectId: createEquipmentDto.projectId,
      },
    });

    return this.mapToResponse(equipment);
  }

  async findAll(search?: string): Promise<EquipmentResponseDto[]> {
    const where = search
      ? {
          OR: [
            { equipo: { contains: search, mode: 'insensitive' as const } },
            { serieCodigo: { contains: search, mode: 'insensitive' as const } },
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

  async update(
    id: number,
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    await this.findOne(id); // Check if exists

    const equipment = await this.prisma.equipmentReport.update({
      where: { id },
      data: updateEquipmentDto,
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
        fechaRetorno: new Date(returnEquipmentDto.fechaRetorno),
        estadoRetorno: returnEquipmentDto.estadoRetorno,
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
      estadoEquipo: equipment.estadoEquipo,
      responsableId: equipment.responsableId,
      fechaSalida: equipment.fechaSalida,
      areaId: equipment.areaId,
      projectId: equipment.projectId,
      fechaRetorno: equipment.fechaRetorno ?? undefined,
      estadoRetorno: equipment.estadoRetorno ?? undefined,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt,
    };
  }
}
