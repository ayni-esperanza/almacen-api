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

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        entradas: createProductDto.entradas || 0,
        salidas: createProductDto.salidas || 0,
        stockActual: createProductDto.stockActual || 0,
        stockMinimo: createProductDto.stockMinimo || 0,
      },
    });

    return {
      ...product,
      marca: product.marca ?? undefined,
      observaciones: product.observaciones ?? undefined,
    };
  }

  async findAll(search?: string): Promise<ProductResponseDto[]> {
    const where = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' as const } },
            { nombre: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ({
      ...product,
      marca: product.marca ?? undefined,
      observaciones: product.observaciones ?? undefined,
    }));
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...product,
      marca: product.marca ?? undefined,
      observaciones: product.observaciones ?? undefined,
    };
  }

  async findByCode(codigo: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { codigo },
    });

    if (!product) {
      throw new NotFoundException(`Product with code ${codigo} not found`);
    }

    return {
      ...product,
      marca: product.marca ?? undefined,
      observaciones: product.observaciones ?? undefined,
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

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return {
      ...product,
      marca: product.marca ?? undefined,
      observaciones: product.observaciones ?? undefined,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Check if exists

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  async getAreas(): Promise<{ nombre: string }[]> {
    return this.prisma.area.findMany({
      select: { nombre: true },
      orderBy: { nombre: 'asc' },
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

    const updatedProduct = await this.prisma.product.update({
      where: { codigo },
      data: {
        entradas: newEntradas,
        salidas: newSalidas,
        stockActual: newStockActual,
      },
    });

    return {
      ...updatedProduct,
      marca: updatedProduct.marca ?? undefined,
      observaciones: updatedProduct.observaciones ?? undefined,
    };
  }
}
