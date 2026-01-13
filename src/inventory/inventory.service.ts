import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { codigo: createProductDto.codigo },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Product with code ${createProductDto.codigo} already exists`,
      );
    }

    // Calculate total cost
    const stockActual = createProductDto.stockActual || 0;
    const costoTotal = stockActual * createProductDto.costoUnitario;

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        entradas: createProductDto.entradas || 0,
        salidas: createProductDto.salidas || 0,
        stockActual,
        costoTotal,
      },
    });

    return {
      ...product,
      categoria: product.categoria || undefined,
      marca: product.marca || undefined,
    };
  }

  async findAll(
    search?: string,
    categoria?: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<{
    data: ProductResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const where: any = {
      deletedAt: null, // FILTRO PARA PRODUCTOS NO ELIMINADOS
    };

    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        {
          provider: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        { marca: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoria) {
      where.categoria = { equals: categoria, mode: 'insensitive' };
    }

    // Usar paginación nativa de Prisma
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { provider: true },
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map((product) => ({
        ...product,
        categoria: product.categoria || undefined,
        marca: product.marca || undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      // Cambie findUnique por findFirst para usar filtros compuestos si fuera necesario, aunque unique id basta
      where: {
        id,
        deletedAt: null, // Solo activos
      },
      include: { provider: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...product,
      categoria: product.categoria || undefined,
      marca: product.marca || undefined,
    };
  }

  async findByCode(codigo: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: {
        codigo,
        deletedAt: null, // Solo activos
      },
      include: { provider: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with code ${codigo} not found`);
    }

    return {
      ...product,
      categoria: product.categoria || undefined,
      marca: product.marca || undefined,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.findOne(id);

    // If codigo is being updated, check for conflicts
    if (
      updateProductDto.codigo &&
      updateProductDto.codigo !== existingProduct.codigo
    ) {
      const conflictingProduct = await this.prisma.product.findUnique({
        where: { codigo: updateProductDto.codigo },
      });

      if (conflictingProduct) {
        throw new ConflictException(
          `Product with code ${updateProductDto.codigo} already exists`,
        );
      }
    }

    // Calculate new total cost if relevant fields are updated
    let costoTotal = existingProduct.costoTotal;
    if (
      updateProductDto.stockActual !== undefined ||
      updateProductDto.costoUnitario !== undefined
    ) {
      const newStockActual =
        updateProductDto.stockActual ?? existingProduct.stockActual;
      const newCostoUnitario =
        updateProductDto.costoUnitario ?? existingProduct.costoUnitario;
      costoTotal = newStockActual * newCostoUnitario;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: { ...updateProductDto, costoTotal },
    });

    // If nombre is being updated, update descripcion in all related movements and equipment reports
    if (
      updateProductDto.nombre &&
      updateProductDto.nombre !== existingProduct.nombre
    ) {
      // Update movement entries
      await this.prisma.movementEntry.updateMany({
        where: { codigoProducto: existingProduct.codigo },
        data: { descripcion: updateProductDto.nombre },
      });

      // Update movement exits
      await this.prisma.movementExit.updateMany({
        where: { codigoProducto: existingProduct.codigo },
        data: { descripcion: updateProductDto.nombre },
      });

      // Update equipment reports
      await this.prisma.equipmentReport.updateMany({
        where: { serieCodigo: existingProduct.codigo },
        data: { equipo: updateProductDto.nombre },
      });
    }

    return {
      ...product,
      categoria: product.categoria || undefined,
      marca: product.marca || undefined,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id); // Verifica que exista y esté activo

    // Generamos un código temporal para liberar el 'unique constraint'
    const timestamp = new Date().getTime();
    const archivedCode = `${product.codigo}_del_${timestamp}`;

    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(), // Marcamos fecha de borrado
        codigo: archivedCode, // Liberamos el código original para que pueda reutilizarse
      },
    });

    return { message: 'Product deleted successfully (logical)' };
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

  async createArea(nombre: string): Promise<{ nombre: string }> {
    return this.prisma.area.create({
      data: { nombre },
      select: { nombre: true },
    });
  }

  async getCategorias(search?: string): Promise<{ nombre: string }[]> {
    const where = search
      ? { nombre: { contains: search, mode: 'insensitive' as const } }
      : {};

    return this.prisma.categoria.findMany({
      where,
      select: { nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createCategoria(nombre: string): Promise<{ nombre: string }> {
    return this.prisma.categoria.create({
      data: { nombre },
      select: { nombre: true },
    });
  }

  async updateStock(
    codigo: string,
    entradas: number,
    salidas: number,
  ): Promise<ProductResponseDto> {
    const product = await this.findByCode(codigo);

    const newEntradas = product.entradas + entradas;
    const newSalidas = product.salidas + salidas;
    const newStockActual = product.stockActual + entradas - salidas;
    const newCostoTotal = newStockActual * product.costoUnitario;

    const updatedProduct = await this.prisma.product.update({
      where: { codigo },
      data: {
        entradas: newEntradas,
        salidas: newSalidas,
        stockActual: newStockActual,
        costoTotal: newCostoTotal,
      },
    });

    return {
      ...updatedProduct,
      categoria: updatedProduct.categoria || undefined,
      marca: updatedProduct.marca || undefined,
    };
  }
}
