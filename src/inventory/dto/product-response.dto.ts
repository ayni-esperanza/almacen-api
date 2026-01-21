import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderResponseDto } from '../../providers/dto/provider-response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  id: number;

  @ApiProperty({ example: 'AF2025', description: 'Unique product code' })
  codigo: string;

  @ApiProperty({ example: 'AFLOJA TODO', description: 'Product name' })
  nombre: string;

  @ApiProperty({ example: 12.0, description: 'Unit cost' })
  costoUnitario: number;

  @ApiProperty({ example: 'ALMACEN', description: 'Storage location' })
  ubicacion: string;

  @ApiProperty({ example: 3, description: 'Total entries' })
  entradas: number;

  @ApiProperty({ example: 2, description: 'Total exits' })
  salidas: number;

  @ApiProperty({ example: 1, description: 'Current stock' })
  stockActual: number;

  @ApiProperty({ example: 10, description: 'Minimum stock level' })
  stockMinimo: number;

  @ApiProperty({ example: 'und', description: 'Unit of measure' })
  unidadMedida: string;

  @ApiProperty({ example: 1, description: 'Provider ID' })
  providerId: number;

  @ApiProperty({ description: 'Proveedor asociado', required: false })
  provider?: Omit<ProviderResponseDto, 'photoUrl'> & {
    photoUrl: string | null;
  };

  @ApiPropertyOptional({ example: 'WD-40', description: 'Product brand' })
  marca?: string | null;

  @ApiProperty({ example: 12.0, description: 'Total cost' })
  costoTotal: number;

  @ApiPropertyOptional({
    example: 'Herramientas',
    description: 'Product category',
  })
  categoria?: string | null;

  @ApiPropertyOptional({
    example: 'OC-2025-001',
    description: 'Orden de Compra',
  })
  oc?: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
