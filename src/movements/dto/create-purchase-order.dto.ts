import { IsString, IsNumber, Min } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsString()
  fecha: string; // Format: "DD/MM/YYYY"
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
