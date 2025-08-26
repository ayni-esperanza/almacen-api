import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateExitDto } from './dto/create-exit.dto';
import { UpdateExitQuantityDto } from './dto/update-exit-quantity.dto';
import { MovementEntryResponseDto, MovementExitResponseDto } from './dto/movement-response.dto';

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async createEntry(createEntryDto: CreateEntryDto): Promise<MovementEntryResponseDto> {
    // Verify product exists
    await this.inventoryService.findByCode(createEntryDto.codigoProducto);

    // Create the entry
    const entry = await this.prisma.movementEntry.create({
      data: createEntryDto,
    });

    // Update product stock
    await this.inventoryService.updateStock(
      createEntryDto.codigoProducto,
      createEntryDto.cantidad,
      0
    );

    return this.mapEntryToResponse(entry);
  }

  async createExit(createExitDto: CreateExitDto): Promise<MovementExitResponseDto> {
    // Verify product exists and has enough stock
    const product = await this.inventoryService.findByCode(createExitDto.codigoProducto);
    
    if (product.stockActual < createExitDto.cantidad) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stockActual}, Requested: ${createExitDto.cantidad}`
      );
    }

    // Create the exit
    const exit = await this.prisma.movementExit.create({
      data: createExitDto,
    });

    // Update product stock
    await this.inventoryService.updateStock(
      createExitDto.codigoProducto,
      0,
      createExitDto.cantidad
    );

    return this.mapExitToResponse(exit);
  }

  async findAllEntries(search?: string): Promise<MovementEntryResponseDto[]> {
    const where = search
      ? {
          OR: [
            { codigoProducto: { contains: search, mode: 'insensitive' as const } },
            { descripcion: { contains: search, mode: 'insensitive' as const } },
            { responsable: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const entries = await this.prisma.movementEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return entries.map(entry => this.mapEntryToResponse(entry));
  }

  async findAllExits(search?: string): Promise<MovementExitResponseDto[]> {
    const where = search
      ? {
          OR: [
            { codigoProducto: { contains: search, mode: 'insensitive' as const } },
            { descripcion: { contains: search, mode: 'insensitive' as const } },
            { responsable: { contains: search, mode: 'insensitive' as const } },
            { proyecto: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return exits.map(exit => this.mapExitToResponse(exit));
  }

  async findExitById(id: number): Promise<MovementExitResponseDto> {
    const exit = await this.prisma.movementExit.findUnique({
      where: { id },
    });

    if (!exit) {
      throw new NotFoundException(`Exit movement with ID ${id} not found`);
    }

    return this.mapExitToResponse(exit);
  }

  async updateExitQuantity(
    id: number,
    updateExitQuantityDto: UpdateExitQuantityDto,
  ): Promise<MovementExitResponseDto> {
    const existingExit = await this.findExitById(id);
    const product = await this.inventoryService.findByCode(existingExit.codigoProducto);

    // Calculate the difference in quantity
    const quantityDifference = updateExitQuantityDto.cantidad - existingExit.cantidad;

    // Check if there's enough stock for the increase
    if (quantityDifference > 0 && product.stockActual < quantityDifference) {
      throw new BadRequestException(
        `Insufficient stock for quantity increase. Available: ${product.stockActual}, Required: ${quantityDifference}`
      );
    }

    // Update the exit
    const updatedExit = await this.prisma.movementExit.update({
      where: { id },
      data: { cantidad: updateExitQuantityDto.cantidad },
    });

    // Update product stock based on the difference
    if (quantityDifference > 0) {
      // Increasing exit quantity (reduce stock)
      await this.inventoryService.updateStock(existingExit.codigoProducto, 0, quantityDifference);
    } else if (quantityDifference < 0) {
      // Decreasing exit quantity (increase stock)
      await this.inventoryService.updateStock(existingExit.codigoProducto, Math.abs(quantityDifference), 0);
    }

    return this.mapExitToResponse(updatedExit);
  }

  async searchMovements(query: string): Promise<{
    entries: MovementEntryResponseDto[];
    exits: MovementExitResponseDto[];
  }> {
    const [entries, exits] = await Promise.all([
      this.findAllEntries(query),
      this.findAllExits(query),
    ]);

    return { entries, exits };
  }

  // Helper methods to map Prisma entities to response DTOs
  private mapEntryToResponse(entry: any): MovementEntryResponseDto {
    return {
      id: entry.id,
      fecha: entry.fecha,
      codigoProducto: entry.codigoProducto,
      descripcion: entry.descripcion,
      precioUnitario: entry.precioUnitario,
      cantidad: entry.cantidad,
      responsable: entry.responsable || undefined,
      area: entry.area || undefined,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  private mapExitToResponse(exit: any): MovementExitResponseDto {
    return {
      id: exit.id,
      fecha: exit.fecha,
      codigoProducto: exit.codigoProducto,
      descripcion: exit.descripcion,
      precioUnitario: exit.precioUnitario,
      cantidad: exit.cantidad,
      responsable: exit.responsable || undefined,
      area: exit.area || undefined,
      proyecto: exit.proyecto || undefined,
      createdAt: exit.createdAt,
      updatedAt: exit.updatedAt,
    };
  }
}