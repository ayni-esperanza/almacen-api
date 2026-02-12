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
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderProductDto,
} from './dto/create-purchase-order.dto';
import {
  UpdatePurchaseOrderDto,
  UpdatePurchaseOrderProductDto,
} from './dto/update-purchase-order.dto';

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async createEntry(
    createEntryDto: CreateEntryDto,
  ): Promise<MovementEntryResponseDto> {
    // Verify product exists and get its category
    const product = await this.inventoryService.findByCode(
      createEntryDto.codigoProducto,
    );

    // Create the entry with product category
    const entry = await this.prisma.movementEntry.create({
      data: {
        ...createEntryDto,
        categoria: product.categoria || undefined,
      },
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

    // Create the exit with product category
    const exit = await this.prisma.movementExit.create({
      data: {
        ...createExitDto,
        categoria: product.categoria || undefined,
      },
    });

    // Update product stock
    await this.inventoryService.updateStock(
      createExitDto.codigoProducto,
      0,
      createExitDto.cantidad,
    );

    return this.mapExitToResponse(exit);
  }

  async findAllEntries(
    search?: string,
    categoria?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 100,
    area?: string,
    responsable?: string,
  ): Promise<{
    data: MovementEntryResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: any = {
      deletedAt: null, // SOLO ACTIVOS
    };

    if (categoria) {
      where.categoria = { equals: categoria, mode: 'insensitive' };
    }

    if (area) {
      where.area = { equals: area, mode: 'insensitive' };
    }

    if (responsable) {
      where.responsable = { equals: responsable, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { codigoProducto: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Si hay filtros de fecha, primero obtenemos todos para filtrar en memoria
    // (ya que fecha es String en formato DD/MM/YYYY)
    if (startDate || endDate) {
      const allEntries = await this.prisma.movementEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Filtrar por fecha en memoria
      const filteredEntries = allEntries.filter((entry) => {
        const [day, month, year] = entry.fecha.split('/');
        const entryDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });

      // Aplicar paginación manual
      const total = filteredEntries.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedEntries = filteredEntries.slice(skip, skip + limit);

      return {
        data: paginatedEntries.map((entry) => this.mapEntryToResponse(entry)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    // Sin filtros de fecha, usar paginación nativa de Prisma
    const [entries, total] = await Promise.all([
      this.prisma.movementEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.movementEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: entries.map((entry) => this.mapEntryToResponse(entry)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findAllExits(
    search?: string,
    categoria?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 100,
    area?: string,
    proyecto?: string,
    responsable?: string,
  ): Promise<{
    data: MovementExitResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: any = {
      deletedAt: null, // SOLO ACTIVOS
    };

    if (categoria) {
      where.categoria = { equals: categoria, mode: 'insensitive' };
    }

    if (area) {
      where.area = { equals: area, mode: 'insensitive' };
    }

    if (proyecto) {
      where.proyecto = { equals: proyecto, mode: 'insensitive' };
    }

    if (responsable) {
      where.responsable = { equals: responsable, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { codigoProducto: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
        { proyecto: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Si hay filtros de fecha, primero obtenemos todos para filtrar en memoria
    // (ya que fecha es String en formato DD/MM/YYYY)
    if (startDate || endDate) {
      const allExits = await this.prisma.movementExit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // Filtrar por fecha en memoria
      const filteredExits = allExits.filter((exit) => {
        const [day, month, year] = exit.fecha.split('/');
        const exitDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        if (startDate && exitDate < startDate) return false;
        if (endDate && exitDate > endDate) return false;
        return true;
      });

      // Aplicar paginación manual
      const total = filteredExits.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedExits = filteredExits.slice(skip, skip + limit);

      return {
        data: paginatedExits.map((exit) => this.mapExitToResponse(exit)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    // Sin filtros de fecha, usar paginación nativa de Prisma
    const [exits, total] = await Promise.all([
      this.prisma.movementExit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.movementExit.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: exits.map((exit) => this.mapExitToResponse(exit)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
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

  async removeEntry(id: number): Promise<{ message: string }> {
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

    return { message: 'Entry deleted successfully' };
  }

  async removeExit(id: number): Promise<{ message: string }> {
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

    return { message: 'Exit deleted successfully' };
  }

  async searchMovements(query: string): Promise<{
    entries: MovementEntryResponseDto[];
    exits: MovementExitResponseDto[];
  }> {
    const [entriesResult, exitsResult] = await Promise.all([
      this.findAllEntries(query, undefined, undefined, undefined, 1, 1000),
      this.findAllExits(query, undefined, undefined, undefined, 1, 1000),
    ]);

    return {
      entries: entriesResult.data,
      exits: exitsResult.data,
    };
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
      categoria: entry.categoria || undefined,
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
      categoria: exit.categoria || undefined,
      createdAt: exit.createdAt,
      updatedAt: exit.updatedAt,
    };
  }

  async getAreas(search?: string): Promise<{ nombre: string }[]> {
    const where = search
      ? { nombre: { contains: search, mode: 'insensitive' as const } }
      : {};

    return this.prisma.area.findMany({
      where,
      select: { nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getEntryFilterOptions(): Promise<{
    areas: string[];
    responsables: string[];
  }> {
    const [areas, responsables] = await Promise.all([
      this.prisma.movementEntry.findMany({
        where: { deletedAt: null, area: { not: null } },
        select: { area: true },
        distinct: ['area'],
        orderBy: { area: 'asc' },
      }),
      this.prisma.movementEntry.findMany({
        where: { deletedAt: null, responsable: { not: null } },
        select: { responsable: true },
        distinct: ['responsable'],
        orderBy: { responsable: 'asc' },
      }),
    ]);

    return {
      areas: areas.map((e) => e.area!).filter(Boolean),
      responsables: responsables.map((e) => e.responsable!).filter(Boolean),
    };
  }

  async getExitFilterOptions(): Promise<{
    areas: string[];
    proyectos: string[];
    responsables: string[];
  }> {
    const [areas, proyectos, responsables] = await Promise.all([
      this.prisma.movementExit.findMany({
        where: { deletedAt: null, area: { not: null } },
        select: { area: true },
        distinct: ['area'],
        orderBy: { area: 'asc' },
      }),
      this.prisma.movementExit.findMany({
        where: { deletedAt: null, proyecto: { not: null } },
        select: { proyecto: true },
        distinct: ['proyecto'],
        orderBy: { proyecto: 'asc' },
      }),
      this.prisma.movementExit.findMany({
        where: { deletedAt: null, responsable: { not: null } },
        select: { responsable: true },
        distinct: ['responsable'],
        orderBy: { responsable: 'asc' },
      }),
    ]);

    return {
      areas: areas.map((e) => e.area!).filter(Boolean),
      proyectos: proyectos.map((e) => e.proyecto!).filter(Boolean),
      responsables: responsables.map((e) => e.responsable!).filter(Boolean),
    };
  }

  async createArea(nombre: string): Promise<{ nombre: string }> {
    return this.prisma.area.create({
      data: { nombre },
      select: { nombre: true },
    });
  }

  /**
   * Backfill categoria for existing movements from current product data
   * This is a one-time migration utility
   */
  async backfillCategorias(): Promise<{
    entriesUpdated: number;
    exitsUpdated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let entriesUpdated = 0;
    let exitsUpdated = 0;

    // Update entries
    const entries = await this.prisma.movementEntry.findMany({
      where: {
        OR: [{ categoria: null }, { categoria: '' }],
      },
    });

    for (const entry of entries) {
      try {
        const product = await this.inventoryService.findByCode(
          entry.codigoProducto,
        );
        if (product.categoria) {
          await this.prisma.movementEntry.update({
            where: { id: entry.id },
            data: { categoria: product.categoria },
          });
          entriesUpdated++;
        }
      } catch (error) {
        errors.push(
          `Entry ${entry.id} (${entry.codigoProducto}): ${error.message}`,
        );
      }
    }

    // Update exits
    const exits = await this.prisma.movementExit.findMany({
      where: {
        OR: [{ categoria: null }, { categoria: '' }],
      },
    });

    for (const exit of exits) {
      try {
        const product = await this.inventoryService.findByCode(
          exit.codigoProducto,
        );
        if (product.categoria) {
          await this.prisma.movementExit.update({
            where: { id: exit.id },
            data: { categoria: product.categoria },
          });
          exitsUpdated++;
        }
      } catch (error) {
        errors.push(
          `Exit ${exit.id} (${exit.codigoProducto}): ${error.message}`,
        );
      }
    }

    return { entriesUpdated, exitsUpdated, errors };
  }
  /**
   * Generate a unique purchase order code
   */
  private async generatePurchaseOrderCode(): Promise<string> {
    const count = await this.prisma.purchaseOrder.count();
    return `OC-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const codigo = await this.generatePurchaseOrderCode();

    return this.prisma.purchaseOrder.create({
      data: {
        codigo,
        ...createPurchaseOrderDto,
      },
    });
  }

  /**
   * Get all purchase orders with pagination and filters
   */
  async findAllPurchaseOrders(
    search?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 100,
  ) {
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { proveedor: { contains: search, mode: 'insensitive' } },
        { observaciones: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      const allOrders = await this.prisma.purchaseOrder.findMany({
        where,
        include: { productos: { where: { deletedAt: null } } },
        orderBy: { createdAt: 'desc' },
      });

      const filteredOrders = allOrders.filter((order) => {
        const [day, month, year] = order.fecha.split('/');
        const orderDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        return true;
      });

      const total = filteredOrders.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
      const paginatedOrders = filteredOrders.slice(skip, skip + limit);

      return {
        data: paginatedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    // No date filters, use native pagination
    const [orders, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: { productos: { where: { deletedAt: null } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a single purchase order by ID
   */
  async findOnePurchaseOrder(id: number) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, deletedAt: null },
      include: { productos: { where: { deletedAt: null } } },
    });

    if (!order) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Update a purchase order
   */
  async updatePurchaseOrder(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    await this.findOnePurchaseOrder(id);

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: updatePurchaseOrderDto,
      include: { productos: { where: { deletedAt: null } } },
    });
  }

  /**
   * Soft delete a purchase order
   */
  async removePurchaseOrder(id: number) {
    await this.findOnePurchaseOrder(id);

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Add a product to a purchase order
   */
  async addProductToPurchaseOrder(
    purchaseOrderId: number,
    createProductDto: CreatePurchaseOrderProductDto,
  ) {
    await this.findOnePurchaseOrder(purchaseOrderId);

    const subtotal = createProductDto.cantidad * createProductDto.costoUnitario;

    // Check if product exists in inventory and has enough stock
    if (createProductDto.codigo) {
      try {
        const inventoryProduct = await this.inventoryService.findByCode(
          createProductDto.codigo,
        );

        // Verify there's enough stock
        if (inventoryProduct.stockActual < createProductDto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${inventoryProduct.stockActual}, Solicitado: ${createProductDto.cantidad}`,
          );
        }

        // Deduct from stock (similar to exit movement)
        await this.inventoryService.updateStock(
          createProductDto.codigo,
          0,
          createProductDto.cantidad,
        );
      } catch (error) {
        // If product doesn't exist in inventory, that's OK - it's a new product for the order
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    const product = await this.prisma.purchaseOrderProduct.create({
      data: {
        purchaseOrderId,
        ...createProductDto,
        subtotal,
      },
    });

    // Update order totals
    await this.updatePurchaseOrderTotals(purchaseOrderId);

    return product;
  }

  /**
   * Get all products in a purchase order
   */
  async findAllPurchaseOrderProducts(purchaseOrderId: number) {
    await this.findOnePurchaseOrder(purchaseOrderId);

    return this.prisma.purchaseOrderProduct.findMany({
      where: {
        purchaseOrderId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Update a product in a purchase order
   */
  async updatePurchaseOrderProduct(
    purchaseOrderId: number,
    productId: number,
    updateProductDto: UpdatePurchaseOrderProductDto,
  ) {
    await this.findOnePurchaseOrder(purchaseOrderId);

    const product = await this.prisma.purchaseOrderProduct.findFirst({
      where: {
        id: productId,
        purchaseOrderId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in purchase order ${purchaseOrderId}`,
      );
    }

    // Calculate new values
    const newCantidad = updateProductDto.cantidad ?? product.cantidad;
    const costoUnitario =
      updateProductDto.costoUnitario ?? product.costoUnitario;
    const subtotal = newCantidad * costoUnitario;

    // If quantity changed and product exists in inventory, adjust stock
    if (
      updateProductDto.cantidad !== undefined &&
      updateProductDto.cantidad !== product.cantidad &&
      product.codigo
    ) {
      try {
        const inventoryProduct = await this.inventoryService.findByCode(
          product.codigo,
        );

        const quantityDifference = newCantidad - product.cantidad;

        if (quantityDifference > 0) {
          // Increased quantity - need more stock
          if (inventoryProduct.stockActual < quantityDifference) {
            throw new BadRequestException(
              `Stock insuficiente para incrementar cantidad. Disponible: ${inventoryProduct.stockActual}, Necesario: ${quantityDifference}`,
            );
          }
          // Deduct additional quantity
          await this.inventoryService.updateStock(
            product.codigo,
            0,
            quantityDifference,
          );
        } else if (quantityDifference < 0) {
          // Decreased quantity - return to stock
          await this.inventoryService.updateStock(
            product.codigo,
            Math.abs(quantityDifference),
            0,
          );
        }
      } catch (error) {
        // If product doesn't exist in inventory, skip stock update
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    const updatedProduct = await this.prisma.purchaseOrderProduct.update({
      where: { id: productId },
      data: {
        ...updateProductDto,
        subtotal,
      },
    });

    // Update order totals
    await this.updatePurchaseOrderTotals(purchaseOrderId);

    return updatedProduct;
  }

  /**
   * Soft delete a product from a purchase order
   */
  async removePurchaseOrderProduct(purchaseOrderId: number, productId: number) {
    await this.findOnePurchaseOrder(purchaseOrderId);

    const product = await this.prisma.purchaseOrderProduct.findFirst({
      where: {
        id: productId,
        purchaseOrderId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in purchase order ${purchaseOrderId}`,
      );
    }

    // If product exists in inventory, return quantity to stock
    if (product.codigo) {
      try {
        await this.inventoryService.findByCode(product.codigo);
        // Revert the stock (add back the quantity)
        await this.inventoryService.updateStock(
          product.codigo,
          product.cantidad,
          0,
        );
      } catch (error) {
        // If product doesn't exist in inventory, skip stock update
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    await this.prisma.purchaseOrderProduct.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    // Update order totals
    await this.updatePurchaseOrderTotals(purchaseOrderId);

    return { message: 'Product deleted successfully' };
  }

  /**
   * Update purchase order totals based on its products
   */
  private async updatePurchaseOrderTotals(purchaseOrderId: number) {
    const products = await this.prisma.purchaseOrderProduct.findMany({
      where: {
        purchaseOrderId,
        deletedAt: null,
      },
    });

    const cantidad = products.reduce((sum, p) => sum + p.cantidad, 0);
    const costo = products.reduce((sum, p) => sum + p.subtotal, 0);

    await this.prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { cantidad, costo },
    });
  }
}
