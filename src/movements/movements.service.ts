import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateExitDto } from './dto/create-exit.dto';
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
    await this.inventoryService.findOne(createEntryDto.productId);

    // Create the entry
    const entry = await this.prisma.movementEntry.create({
      data: createEntryDto,
    });

    // Update product stock
    await this.inventoryService.updateStock(
      (await this.inventoryService.findOne(createEntryDto.productId)).codigo,
      createEntryDto.cantidad,
      0,
    );

    return this.mapEntryToResponse(entry);
  }

  async createExit(
    createExitDto: CreateExitDto,
  ): Promise<MovementExitResponseDto> {
    // Verify product exists and has enough stock
    const product = await this.inventoryService.findOne(
      createExitDto.productId,
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
      product.codigo,
      0,
      createExitDto.cantidad,
    );

    return this.mapExitToResponse(exit);
  }

  async findAllEntries(search?: string): Promise<MovementEntryResponseDto[]> {
    const where = search
      ? {
          OR: [
            { descripcion: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const entries = await this.prisma.movementEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => this.mapEntryToResponse(entry));
  }

  async findAllExits(search?: string): Promise<MovementExitResponseDto[]> {
    const where = search
      ? {
          OR: [
            { descripcion: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const exits = await this.prisma.movementExit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return exits.map((exit) => this.mapExitToResponse(exit));
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

    // Get product by ID to obtain its codigo
    const productById = await this.prisma.product.findUnique({
      where: { id: existingExit.productId },
    });

    if (!productById) {
      throw new BadRequestException('Product not found');
    }

    const product = await this.inventoryService.findByCode(productById.codigo);

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
        productById.codigo,
        0,
        quantityDifference,
      );
    } else if (quantityDifference < 0) {
      // Decreasing exit quantity (increase stock)
      await this.inventoryService.updateStock(
        productById.codigo,
        Math.abs(quantityDifference),
        0,
      );
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
      productId: entry.productId,
      descripcion: entry.descripcion,
      cantidad: entry.cantidad,
      areaId: entry.areaId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  private mapExitToResponse(exit: any): MovementExitResponseDto {
    return {
      id: exit.id,
      fecha: exit.fecha,
      productId: exit.productId,
      descripcion: exit.descripcion,
      cantidad: exit.cantidad,
      responsableId: exit.responsableId,
      areaId: exit.areaId,
      projectId: exit.projectId,
      createdAt: exit.createdAt,
      updatedAt: exit.updatedAt,
    };
  }
}
