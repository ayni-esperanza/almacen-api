import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateExitDto } from './dto/create-exit.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateExitDto } from './dto/update-exit.dto';
import { UpdateExitQuantityDto } from './dto/update-exit-quantity.dto';
import {
  MovementEntryResponseDto,
  MovementExitResponseDto,
} from './dto/movement-response.dto';

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async createEntry(
    createEntryDto: CreateEntryDto,
  ): Promise<MovementEntryResponseDto> {
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
      0,
    );

    return this.mapEntryToResponse(entry);
  }

  async createExit(
    createExitDto: CreateExitDto,
  ): Promise<MovementExitResponseDto> {
    // Verify product exists and has enough stock
    const product = await this.inventoryService.findByCode(
      createExitDto.codigoProducto,
    );

    if (product.stockActual < createExitDto.cantidad) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stockActual}, Requested: ${createExitDto.cantidad}`,
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
      createExitDto.cantidad,
    );

    return this.mapExitToResponse(exit);
  }

  async findAllEntries(search?: string): Promise<MovementEntryResponseDto[]> {
    const where: any = {
      deletedAt: null, // SOLO ACTIVOS
    };

    if (search) {
      where.OR = [
        { codigoProducto: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
      ];
    }

    const entries = await this.prisma.movementEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => this.mapEntryToResponse(entry));
  }

  async findAllExits(search?: string): Promise<MovementExitResponseDto[]> {
    const where: any = {
      deletedAt: null, // SOLO ACTIVOS
    };

    if (search) {
      where.OR = [
        { codigoProducto: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
        { proyecto: { contains: search, mode: 'insensitive' } },
      ];
    }

    const exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return exits.map((exit) => this.mapExitToResponse(exit));
  }

  async findExitById(id: number): Promise<MovementExitResponseDto> {
    const exit = await this.prisma.movementExit.findFirst({
      where: {
        id,
        deletedAt: null, // SOLO ACTIVOS
      },
    });

    if (!exit) {
      throw new NotFoundException(`Exit movement with ID ${id} not found`);
    }

    return this.mapExitToResponse(exit);
  }

  async findEntryById(id: number): Promise<MovementEntryResponseDto> {
    const entry = await this.prisma.movementEntry.findFirst({
      where: {
        id,
        deletedAt: null, // SOLO ACTIVOS
      },
    });

    if (!entry) {
      throw new NotFoundException(`Entry movement with ID ${id} not found`);
    }

    return this.mapEntryToResponse(entry);
  }

  async updateEntry(
    id: number,
    updateEntryDto: UpdateEntryDto,
  ): Promise<MovementEntryResponseDto> {
    const existingEntry = await this.findEntryById(id);

    // If quantity is being updated, adjust stock
    if (
      updateEntryDto.cantidad !== undefined &&
      updateEntryDto.cantidad !== existingEntry.cantidad
    ) {
      const product = await this.inventoryService.findByCode(
        existingEntry.codigoProducto,
      );
      const quantityDifference =
        updateEntryDto.cantidad - existingEntry.cantidad;

      if (quantityDifference < 0) {
        // Decreasing entry quantity (reduce stock)
        // Check if there's enough stock to reduce
        if (product.stockActual < Math.abs(quantityDifference)) {
          throw new BadRequestException(
            `Cannot reduce entry quantity. Stock reduction of ${Math.abs(quantityDifference)} would result in negative stock. Available: ${product.stockActual}`,
          );
        }
        await this.inventoryService.updateStock(
          existingEntry.codigoProducto,
          0,
          Math.abs(quantityDifference),
        );
      } else if (quantityDifference > 0) {
        // Increasing entry quantity (increase stock)
        await this.inventoryService.updateStock(
          existingEntry.codigoProducto,
          quantityDifference,
          0,
        );
      }
    }

    // Update the entry
    const updatedEntry = await this.prisma.movementEntry.update({
      where: { id },
      data: updateEntryDto,
    });

    return this.mapEntryToResponse(updatedEntry);
  }

  async updateExitQuantity(
    id: number,
    updateExitQuantityDto: UpdateExitQuantityDto,
  ): Promise<MovementExitResponseDto> {
    const existingExit = await this.findExitById(id);
    const product = await this.inventoryService.findByCode(
      existingExit.codigoProducto,
    );

    // Calculate the difference in quantity
    const quantityDifference =
      updateExitQuantityDto.cantidad - existingExit.cantidad;

    // Check if there's enough stock for the increase
    if (quantityDifference > 0 && product.stockActual < quantityDifference) {
      throw new BadRequestException(
        `Insufficient stock for quantity increase. Available: ${product.stockActual}, Required: ${quantityDifference}`,
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
      await this.inventoryService.updateStock(
        existingExit.codigoProducto,
        0,
        quantityDifference,
      );
    } else if (quantityDifference < 0) {
      // Decreasing exit quantity (increase stock)
      await this.inventoryService.updateStock(
        existingExit.codigoProducto,
        Math.abs(quantityDifference),
        0,
      );
    }

    return this.mapExitToResponse(updatedExit);
  }

  async updateExit(
    id: number,
    updateExitDto: UpdateExitDto,
  ): Promise<MovementExitResponseDto> {
    const existingExit = await this.findExitById(id);

    // If quantity is being updated, adjust stock
    if (
      updateExitDto.cantidad !== undefined &&
      updateExitDto.cantidad !== existingExit.cantidad
    ) {
      const product = await this.inventoryService.findByCode(
        existingExit.codigoProducto,
      );
      const quantityDifference = updateExitDto.cantidad - existingExit.cantidad;

      if (quantityDifference > 0 && product.stockActual < quantityDifference) {
        throw new BadRequestException(
          `Insufficient stock for quantity increase. Available: ${product.stockActual}, Required: ${quantityDifference}`,
        );
      }

      if (quantityDifference > 0) {
        await this.inventoryService.updateStock(
          existingExit.codigoProducto,
          0,
          quantityDifference,
        );
      } else if (quantityDifference < 0) {
        await this.inventoryService.updateStock(
          existingExit.codigoProducto,
          Math.abs(quantityDifference),
          0,
        );
      }
    }

    const updatedExit = await this.prisma.movementExit.update({
      where: { id },
      data: updateExitDto,
    });

    return this.mapExitToResponse(updatedExit);
  }

  async removeEntry(id: number): Promise<void> {
    // Obtener la entrada (valida si existe y no está borrada)
    const entry = await this.findEntryById(id);

    // Verificar stock del producto
    const product = await this.inventoryService.findByCode(
      entry.codigoProducto,
    );

    // sin romper la coherencia (quedaría stock negativo).
    if (product.stockActual < entry.cantidad) {
      throw new BadRequestException(
        `Cannot delete entry. Insufficient stock to revert operation. Current: ${product.stockActual}, Required to revert: ${entry.cantidad}`,
      );
    }

    // Revertir Stock (Restar lo que se sumó)
    // Pasamos 0 entradas y 'cantidad' en salidas para restar
    await this.inventoryService.updateStock(
      entry.codigoProducto,
      0,
      entry.cantidad,
    );

    // Soft Delete
    await this.prisma.movementEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async removeExit(id: number): Promise<void> {
    // Obtener la salida
    const exit = await this.findExitById(id);

    // Revertir Stock (Sumar lo que se restó)
    // Pasamos 'cantidad' en entradas y 0 salidas para sumar
    await this.inventoryService.updateStock(
      exit.codigoProducto,
      exit.cantidad,
      0,
    );

    // Soft Delete
    await this.prisma.movementExit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
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
