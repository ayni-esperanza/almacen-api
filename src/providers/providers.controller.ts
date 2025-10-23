import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({
    status: 201,
    description: 'Provider created successfully',
    type: ProviderResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Provider email already exists' })
  create(
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<ProviderResponseDto> {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({
    status: 200,
    description: 'List of providers',
    type: [ProviderResponseDto],
  })
  findAll(): Promise<ProviderResponseDto[]> {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({
    status: 200,
    description: 'Provider found',
    type: ProviderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProviderResponseDto> {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update provider' })
  @ApiResponse({
    status: 200,
    description: 'Provider updated successfully',
    type: ProviderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiResponse({ status: 409, description: 'Provider email already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProviderDto: UpdateProviderDto,
  ): Promise<ProviderResponseDto> {
    return this.providersService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete provider' })
  @ApiResponse({ status: 200, description: 'Provider deleted successfully' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.providersService.remove(id);
  }
}
