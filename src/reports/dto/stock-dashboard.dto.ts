import { ApiProperty } from '@nestjs/swagger';

// DTO para el producto crítico
export class CriticalProductDto {
  @ApiProperty({ example: 'PROD-001', description: 'Código del producto' })
  codigo: string;

  @ApiProperty({
    example: 'Martillo Stanley',
    description: 'Nombre del producto',
  })
  nombre: string;

  @ApiProperty({ example: 5, description: 'Stock actual disponible' })
  stockActual: number;

  @ApiProperty({ example: 10, description: 'Stock mínimo configurado' })
  stockMinimo: number;

  @ApiProperty({
    example: 50,
    description: 'Porcentaje respecto al stock mínimo',
  })
  porcentajeStockMinimo: number;

  @ApiProperty({ example: 'Almacén A', description: 'Ubicación del producto' })
  ubicacion: string;

  @ApiProperty({
    example: 'Herramientas',
    description: 'Categoría del producto',
    required: false,
  })
  categoria?: string;
}

// DTO para el producto menos movido
export class LeastMovedProductDto {
  @ApiProperty({ example: 'PROD-002', description: 'Código del producto' })
  codigo: string;

  @ApiProperty({
    example: 'Destornillador Phillips',
    description: 'Nombre del producto',
  })
  nombre: string;

  @ApiProperty({ example: 3, description: 'Cantidad de movimientos de salida' })
  cantidadMovimientos: number;

  @ApiProperty({ example: 25, description: 'Stock actual disponible' })
  stockActual: number;

  @ApiProperty({ example: 'Almacén B', description: 'Ubicación del producto' })
  ubicacion: string;
}

// DTO para el producto más movido
export class MostMovedProductDto {
  @ApiProperty({ example: 'PROD-003', description: 'Código del producto' })
  codigo: string;

  @ApiProperty({ example: 'Clavos 2"', description: 'Nombre del producto' })
  nombre: string;

  @ApiProperty({
    example: 45,
    description: 'Cantidad de movimientos de salida en el período',
  })
  cantidadMovimientos: number;

  @ApiProperty({
    example: 150,
    description: 'Unidades totales salidas en el período',
  })
  unidadesTotalesSalidas: number;

  @ApiProperty({ example: 200, description: 'Stock actual disponible' })
  stockActual: number;

  @ApiProperty({ example: '30 días', description: 'Período analizado' })
  periodo: string;
}

// DTO principal del dashboard de stock
export class StockDashboardDto {
  @ApiProperty({
    example: 1250,
    description: 'Total de unidades en stock (suma de todos los productos)',
  })
  totalProductos: number;

  @ApiProperty({
    example: 45678.5,
    description:
      'Valor total del inventario (suma de costo unitario × stock actual)',
  })
  valorTotalInventario: number;

  @ApiProperty({
    type: CriticalProductDto,
    description: 'Producto con menor stock disponible (excluyendo stock = 0)',
    required: false,
  })
  productoCritico?: CriticalProductDto;

  @ApiProperty({
    type: LeastMovedProductDto,
    description: 'Producto con menor cantidad de movimientos de salida',
    required: false,
  })
  productoMenosMovido?: LeastMovedProductDto;

  @ApiProperty({
    type: MostMovedProductDto,
    description: 'Producto con mayor cantidad de movimientos de salida',
    required: false,
  })
  productoMasMovido?: MostMovedProductDto;

  @ApiProperty({
    example: 30,
    description: 'Período en días usado para calcular el producto más movido',
  })
  periodoAnalisisDias: number;
}
