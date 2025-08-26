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

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
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
  create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.inventoryService.create(createProductDto);
  }

  @Get('products')
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
  @ApiOperation({ summary: 'Get all available areas' })
  @ApiResponse({
    status: 200,
    description: 'Areas retrieved successfully',
  })
  getAreas(): Promise<{ nombre: string }[]> {
    return this.inventoryService.getAreas();
  }

  @Get('products/search')
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

  @Get('products/:id')
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
