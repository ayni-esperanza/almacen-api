import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { PurchaseOrderStatus } from '@prisma/client';

export class CreatePurchaseOrderDto {
  @IsString()
  fecha: string; // Format: "DD/MM/YYYY"

  @IsString()
  @IsOptional()
  proveedor?: string;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  estado?: PurchaseOrderStatus;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class CreatePurchaseOrderProductDto {
  @IsString()
  fecha: string; // Format: "DD/MM/YYYY"

  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  area: string;

  @IsString()
  proyecto: string;

  @IsString()
  responsable: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  costoUnitario: number;
}
