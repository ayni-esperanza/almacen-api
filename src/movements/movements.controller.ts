import {
  Controller,
  Get,
  Post,
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
import { UpdateExitQuantityDto } from './dto/update-exit-quantity.dto';
import { MovementEntryResponseDto, MovementExitResponseDto } from './dto/movement-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post('entries')
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
  createEntry(@Body() createEntryDto: CreateEntryDto): Promise<MovementEntryResponseDto> {
    return this.movementsService.createEntry(createEntryDto);
  }

  @Post('exits')
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
  createExit(@Body() createExitDto: CreateExitDto): Promise<MovementExitResponseDto> {
    return this.movementsService.createExit(createExitDto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get all entry movements' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Entries retrieved successfully',
    type: [MovementEntryResponseDto],
  })
  findAllEntries(@Query('q') search?: string): Promise<MovementEntryResponseDto[]> {
    return this.movementsService.findAllEntries(search);
  }

  @Get('exits')
  @ApiOperation({ summary: 'Get all exit movements' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Exits retrieved successfully',
    type: [MovementExitResponseDto],
  })
  findAllExits(@Query('q') search?: string): Promise<MovementExitResponseDto[]> {
    return this.movementsService.findAllExits(search);
  }

  @Get('search')
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

  @Patch('exits/:id/quantity')
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
}
