import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';
import { Permission } from './enums/permissions.enum';
import {
  createRoleSchema,
  updateRoleSchema,
  CreateRoleDto,
  UpdateRoleDto,
} from '@repo/shared-schemas';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiOperation({ summary: 'List all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get role by id' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() body: CreateRoleDto) {
    const parsed = createRoleSchema.parse(body);
    return this.rolesService.create(parsed);
  }

  @Patch(':id')
  @Permissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiOperation({ summary: 'Update a role' })
  update(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    const parsed = updateRoleSchema.parse(body);
    return this.rolesService.update(id, parsed);
  }

  @Delete(':id')
  @Permissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiOperation({ summary: 'Delete a role' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
