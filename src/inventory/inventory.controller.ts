import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permissions.enum';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  @RequirePermissions(Permission.INVENTORY_CREATE)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Product code already exists',
  })
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.inventoryService.create(createProductDto);
  }

  @Get('products')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filter by category (e.g., "epp")',
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
    description: 'Products retrieved successfully',
  })
  async findAll(
    @Query('q') search?: string,
    @Query('categoria') categoria?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: ProductResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.inventoryService.findAll(search, categoria, pageNum, limitNum);
  }

  @Get('ubicaciones')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get all available locations' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query for filtering locations',
  })
  @ApiResponse({
    status: 200,
    description: 'Locations retrieved successfully',
  })
  getUbicaciones(@Query('search') search?: string): Promise<{ nombre: string }[]> {
    return this.inventoryService.getUbicaciones(search);
  }

  @Post('ubicaciones')
  @RequirePermissions(Permission.INVENTORY_CREATE)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'Location created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Location already exists',
  })
  createUbicacion(@Body() body: { nombre: string }): Promise<{ nombre: string }> {
    return this.inventoryService.createUbicacion(body.nombre);
  }

  @Patch('ubicaciones/:nombre')
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Location name already exists',
  })
  updateUbicacion(
    @Param('nombre') nombre: string,
    @Body() body: { nombre: string },
  ): Promise<{ nombre: string }> {
    return this.inventoryService.updateUbicacion(nombre, body.nombre);
  }

  @Delete('ubicaciones/:nombre')
  @RequirePermissions(Permission.INVENTORY_DELETE)
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({
    status: 200,
    description: 'Location deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found',
  })
  deleteUbicacion(@Param('nombre') nombre: string): Promise<{ message: string }> {
    return this.inventoryService.deleteUbicacion(nombre);
  }

  @Get('categorias')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get all available categories' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query for filtering categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  getCategorias(
    @Query('search') search?: string,
  ): Promise<{ nombre: string }[]> {
    return this.inventoryService.getCategorias(search);
  }

  @Post('categorias')
  @RequirePermissions(Permission.INVENTORY_CREATE)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Category already exists',
  })
  createCategoria(
    @Body() body: { nombre: string },
  ): Promise<{ nombre: string }> {
    return this.inventoryService.createCategoria(body.nombre);
  }

  @Patch('categorias/:nombre')
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists',
  })
  updateCategoria(
    @Param('nombre') nombre: string,
    @Body() body: { nombre: string },
  ): Promise<{ nombre: string }> {
    return this.inventoryService.updateCategoria(nombre, body.nombre);
  }

  @Delete('categorias/:nombre')
  @RequirePermissions(Permission.INVENTORY_DELETE)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  deleteCategoria(
    @Param('nombre') nombre: string,
  ): Promise<{ message: string }> {
    return this.inventoryService.deleteCategoria(nombre);
  }

  @Get('products/search')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filter by category (e.g., "epp")',
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
    description: 'Search results retrieved successfully',
  })
  async search(
    @Query('q') query: string,
    @Query('categoria') categoria?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: ProductResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.inventoryService.findAll(query, categoria, pageNum, limitNum);
  }

  @Get('products/code/:codigo')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get product by code' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findByCode(@Param('codigo') codigo: string): Promise<ProductResponseDto> {
    return this.inventoryService.findByCode(codigo);
  }

  @Get('products/:id')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.inventoryService.findOne(+id);
  }

  @Patch('products/:id')
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Product code already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.inventoryService.update(+id, updateProductDto);
  }

  @Delete('products/:id')
  @RequirePermissions(Permission.INVENTORY_DELETE)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.inventoryService.remove(+id);
  }
}
