import { PartialType } from '@nestjs/mapped-types';
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderProductDto,
} from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto extends PartialType(
  CreatePurchaseOrderDto,
) {}

export class UpdatePurchaseOrderProductDto extends PartialType(
  CreatePurchaseOrderProductDto,
) {}
