import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MovementsService } from './movements.service';
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permissions.enum';

@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post('entries')
  @RequirePermissions(Permission.MOVEMENTS_CREATE)
  @ApiOperation({ summary: 'Create a new entry movement' })
  @ApiResponse({
    status: 201,
    description: 'Entry created successfully',
    type: MovementEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  createEntry(
    @Body() createEntryDto: CreateEntryDto,
  ): Promise<MovementEntryResponseDto> {
    return this.movementsService.createEntry(createEntryDto);
  }

  @Post('exits')
  @RequirePermissions(Permission.MOVEMENTS_CREATE)
  @ApiOperation({ summary: 'Create a new exit movement' })
  @ApiResponse({
    status: 201,
    description: 'Exit created successfully',
    type: MovementExitResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  createExit(
    @Body() createExitDto: CreateExitDto,
  ): Promise<MovementExitResponseDto> {
    return this.movementsService.createExit(createExitDto);
  }

  @Get('entries')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Get all entry movements' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filter by product category (e.g., "EPP")',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Entries retrieved successfully',
  })
  async findAllEntries(
    @Query('q') search?: string,
    @Query('categoria') categoria?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: MovementEntryResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.movementsService.findAllEntries(
      search,
      categoria,
      startDate,
      endDate,
      pageNum,
      limitNum,
    );
  }

  @Get('exits')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Get all exit movements' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filter by product category (e.g., "EPP")',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Exits retrieved successfully',
  })
  async findAllExits(
    @Query('q') search?: string,
    @Query('categoria') categoria?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: MovementExitResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.movementsService.findAllExits(
      search,
      categoria,
      startDate,
      endDate,
      pageNum,
      limitNum,
    );
  }

  @Get('search')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Search all movements' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  searchMovements(@Query('q') query: string): Promise<{
    entries: MovementEntryResponseDto[];
    exits: MovementExitResponseDto[];
  }> {
    return this.movementsService.searchMovements(query);
  }

  @Patch('entries/:id')
  @RequirePermissions(Permission.MOVEMENTS_UPDATE)
  @ApiOperation({ summary: 'Update entry movement' })
  @ApiResponse({
    status: 200,
    description: 'Entry updated successfully',
    type: MovementEntryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or insufficient stock for quantity reduction',
  })
  @ApiResponse({
    status: 404,
    description: 'Entry movement not found',
  })
  updateEntry(
    @Param('id') id: string,
    @Body() updateEntryDto: UpdateEntryDto,
  ): Promise<MovementEntryResponseDto> {
    return this.movementsService.updateEntry(+id, updateEntryDto);
  }

  @Patch('exits/:id')
  @RequirePermissions(Permission.MOVEMENTS_UPDATE)
  @ApiOperation({ summary: 'Update exit movement' })
  @ApiResponse({
    status: 200,
    description: 'Exit updated successfully',
    type: MovementExitResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or insufficient stock for quantity increase',
  })
  @ApiResponse({
    status: 404,
    description: 'Exit movement not found',
  })
  updateExit(
    @Param('id') id: string,
    @Body() updateExitDto: UpdateExitDto,
  ): Promise<MovementExitResponseDto> {
    return this.movementsService.updateExit(+id, updateExitDto);
  }

  @Patch('exits/:id/quantity')
  @RequirePermissions(Permission.MOVEMENTS_UPDATE)
  @ApiOperation({ summary: 'Update exit movement quantity' })
  @ApiResponse({
    status: 200,
    description: 'Exit quantity updated successfully',
    type: MovementExitResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Exit movement not found',
  })
  updateExitQuantity(
    @Param('id') id: string,
    @Body() updateExitQuantityDto: UpdateExitQuantityDto,
  ): Promise<MovementExitResponseDto> {
    return this.movementsService.updateExitQuantity(+id, updateExitQuantityDto);
  }

  @Delete('entries/:id')
  @RequirePermissions(Permission.MOVEMENTS_DELETE)
  @ApiOperation({ summary: 'Delete (soft) entry movement and revert stock' })
  @ApiResponse({
    status: 200,
    description: 'Entry deleted and stock reverted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock to revert the entry',
  })
  @ApiResponse({
    status: 404,
    description: 'Entry movement not found',
  })
  removeEntry(@Param('id') id: string): Promise<{ message: string }> {
    return this.movementsService.removeEntry(+id);
  }

  @Delete('exits/:id')
  @RequirePermissions(Permission.MOVEMENTS_DELETE)
  @ApiOperation({ summary: 'Delete (soft) exit movement and revert stock' })
  @ApiResponse({
    status: 200,
    description: 'Exit deleted and stock reverted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Exit movement not found',
  })
  removeExit(@Param('id') id: string): Promise<{ message: string }> {
    return this.movementsService.removeExit(+id);
  }

  @Get('areas')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Get all available areas for movements' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query for filtering areas',
  })
  @ApiResponse({
    status: 200,
    description: 'Areas retrieved successfully',
  })
  getAreas(@Query('search') search?: string): Promise<{ nombre: string }[]> {
    return this.movementsService.getAreas(search);
  }

  @Post('areas')
  @RequirePermissions(Permission.MOVEMENTS_CREATE)
  @ApiOperation({ summary: 'Create a new area for movements' })
  @ApiResponse({
    status: 201,
    description: 'Area created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Area already exists',
  })
  createArea(@Body() body: { nombre: string }): Promise<{ nombre: string }> {
    return this.movementsService.createArea(body.nombre);
  }

  @Post('backfill-categorias')
  @RequirePermissions(Permission.MOVEMENTS_UPDATE)
  @ApiOperation({
    summary: 'Backfill categoria field for existing movements',
    description:
      'One-time migration utility to update existing movements with categoria from current product data',
  })
  @ApiResponse({
    status: 200,
    description: 'Backfill completed',
  })
  async backfillCategorias(): Promise<{
    entriesUpdated: number;
    exitsUpdated: number;
    errors: string[];
  }> {
    return this.movementsService.backfillCategorias();
  }

  // ============================================
  // PURCHASE ORDERS
  // ============================================

  @Post('purchase-orders')
  @RequirePermissions(Permission.MOVEMENTS_CREATE)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Purchase order created successfully',
  })
  createPurchaseOrder(@Body() createDto: CreatePurchaseOrderDto) {
    return this.movementsService.createPurchaseOrder(createDto);
  }

  @Get('purchase-orders')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllPurchaseOrders(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.movementsService.findAllPurchaseOrders(
      search,
      startDate,
      endDate,
      page ? +page : 1,
      limit ? +limit : 100,
    );
  }

  @Get('purchase-orders/:id')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Get a single purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order not found',
  })
  findOnePurchaseOrder(@Param('id') id: string) {
    return this.movementsService.findOnePurchaseOrder(+id);
  }

  @Patch('purchase-orders/:id')
  @RequirePermissions(Permission.MOVEMENTS_UPDATE)
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order not found',
  })
  updatePurchaseOrder(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderDto,
  ) {
    return this.movementsService.updatePurchaseOrder(+id, updateDto);
  }

  @Delete('purchase-orders/:id')
  @RequirePermissions(Permission.MOVEMENTS_DELETE)
  @ApiOperation({ summary: 'Delete (soft) a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order not found',
  })
  removePurchaseOrder(@Param('id') id: string) {
    return this.movementsService.removePurchaseOrder(+id);
  }

  // ============================================
  // PURCHASE ORDER PRODUCTS
  // ============================================

  @Post('purchase-orders/:id/products')
  @RequirePermissions(Permission.MOVEMENTS_CREATE)
  @ApiOperation({ summary: 'Add a product to a purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Product added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order not found',
  })
  addProductToPurchaseOrder(
    @Param('id') id: string,
    @Body() createProductDto: CreatePurchaseOrderProductDto,
  ) {
    return this.movementsService.addProductToPurchaseOrder(
      +id,
      createProductDto,
    );
  }

  @Get('purchase-orders/:id/products')
  @RequirePermissions(Permission.MOVEMENTS_READ)
  @ApiOperation({ summary: 'Get all products in a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order not found',
  })
  findAllPurchaseOrderProducts(@Param('id') id: string) {
    return this.movementsService.findAllPurchaseOrderProducts(+id);
  }

  @Patch('purchase-orders/:id/products/:productId')
  @RequirePermissions(Permission.MOVEMENTS_UPDATE)
  @ApiOperation({ summary: 'Update a product in a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order or product not found',
  })
  updatePurchaseOrderProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdatePurchaseOrderProductDto,
  ) {
    return this.movementsService.updatePurchaseOrderProduct(
      +id,
      +productId,
      updateProductDto,
    );
  }

  @Delete('purchase-orders/:id/products/:productId')
  @RequirePermissions(Permission.MOVEMENTS_DELETE)
  @ApiOperation({ summary: 'Delete (soft) a product from a purchase order' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Purchase order or product not found',
  })
  removePurchaseOrderProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.movementsService.removePurchaseOrderProduct(+id, +productId);
  }
}
