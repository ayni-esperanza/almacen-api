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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ReturnEquipmentDto } from './dto/return-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permissions.enum';

@ApiTags('Equipment')
@Controller('equipment')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @RequirePermissions(Permission.EQUIPMENT_CREATE)
  @ApiOperation({ summary: 'Create new equipment report' })
  @ApiResponse({
    status: 201,
    description: 'Equipment report created successfully',
    type: EquipmentResponseDto,
  })
  create(@Body() createEquipmentDto: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @RequirePermissions(Permission.EQUIPMENT_READ)
  @ApiOperation({ summary: 'Get all equipment reports' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Equipment reports retrieved successfully',
    type: [EquipmentResponseDto],
  })
  findAll(@Query('q') search?: string): Promise<EquipmentResponseDto[]> {
    return this.equipmentService.findAll(search);
  }

  @Get(':id')
  @RequirePermissions(Permission.EQUIPMENT_READ)
  @ApiOperation({ summary: 'Get equipment report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Equipment report retrieved successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment report not found',
  })
  findOne(@Param('id') id: string): Promise<EquipmentResponseDto> {
    return this.equipmentService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.EQUIPMENT_UPDATE)
  @ApiOperation({ summary: 'Update equipment report' })
  @ApiResponse({
    status: 200,
    description: 'Equipment report updated successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment report not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.EQUIPMENT_DELETE)
  @ApiOperation({ summary: 'Delete equipment report' })
  @ApiResponse({
    status: 200,
    description: 'Equipment report deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment report not found',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.equipmentService.remove(+id);
  }

  @Patch(':id/return')
  @RequirePermissions(Permission.EQUIPMENT_UPDATE)
  @ApiOperation({ summary: 'Register equipment return' })
  @ApiResponse({
    status: 200,
    description: 'Equipment return registered successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment report not found',
  })
  registerReturn(
    @Param('id') id: string,
    @Body() returnEquipmentDto: ReturnEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.registerReturn(+id, returnEquipmentDto);
  }
}
