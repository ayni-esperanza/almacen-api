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
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  findAll(@Query('q') search?: string): Promise<ProductResponseDto[]> {
    return this.inventoryService.findAll(search);
  }

  @Get('areas')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get all available areas' })
  @ApiResponse({
    status: 200,
    description: 'Areas retrieved successfully',
  })
  getAreas(): Promise<{ nombre: string }[]> {
    return this.inventoryService.getAreas();
  }

  @Post('areas')
  @RequirePermissions(Permission.INVENTORY_CREATE)
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({
    status: 201,
    description: 'Area created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Area already exists',
  })
  createArea(@Body() body: { nombre: string }): Promise<{ nombre: string }> {
    return this.inventoryService.createArea(body.nombre);
  }

  @Get('categorias')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Get all available categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  getCategorias(): Promise<{ nombre: string }[]> {
    return this.inventoryService.getCategorias();
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

  @Get('products/search')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [ProductResponseDto],
  })
  search(@Query('q') query: string): Promise<ProductResponseDto[]> {
    return this.inventoryService.findAll(query);
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
