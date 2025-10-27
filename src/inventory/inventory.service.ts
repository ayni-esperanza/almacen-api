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
    // Check if product code already exists
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

  async findAll(search?: string): Promise<ProductResponseDto[]> {
    const where = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' as const } },
            { nombre: { contains: search, mode: 'insensitive' as const } },
            {
              provider: {
                name: { contains: search, mode: 'insensitive' as const },
              },
            },
            { marca: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const products = await this.prisma.product.findMany({
      where,
      include: { provider: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ({
      ...product,
      categoria: product.categoria || undefined,
      marca: product.marca || undefined,
    }));
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
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
      where: { codigo },
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
      data: {
        ...updateProductDto,
        costoTotal,
      },
    });

    return {
      ...product,
      categoria: product.categoria || undefined,
      marca: product.marca || undefined,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Check if exists

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
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
