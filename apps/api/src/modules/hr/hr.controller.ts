import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  CreateDepartmentDto as CreateDepartmentSchemaDto,
  UpdateDepartmentDto as UpdateDepartmentSchemaDto,
} from '@repo/shared-schemas';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('employees')
  @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllEmployees(@Query() query: QueryEmployeeDto) {
    return this.hrService.findAllEmployees(query);
  }

  @Get('employees/:id')
  findEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findEmployeeById(id);
  }

  @Patch('employees/:id')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.hrService.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  @RequirePermissions(Permission.HR_DELETE_EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeEmployee(id);
  }

  @Post('departments')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  createDepartment(@Body() dto: CreateDepartmentSchemaDto) {
    const parsed = createDepartmentSchema.parse(dto);
    return this.hrService.createDepartment(parsed);
  }

  @Get('departments')
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findAllDepartments() {
    return this.hrService.findAllDepartments();
  }

  @Get('departments/:id')
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDepartmentById(id);
  }

  @Patch('departments/:id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentSchemaDto,
  ) {
    const parsed = updateDepartmentSchema.parse(dto);
    return this.hrService.updateDepartment(id, parsed);
  }

  @Delete('departments/:id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDepartment(id);
  }

  @Post('designations')
  createDesignation(@Body() dto: CreateDesignationDto) {
    return this.hrService.createDesignation(dto);
  }

  @Get('designations')
  findAllDesignations() {
    return this.hrService.findAllDesignations();
  }

  @Get('designations/:id')
  findDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDesignationById(id);
  }

  @Patch('designations/:id')
  updateDesignation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    return this.hrService.updateDesignation(id, dto);
  }

  @Delete('designations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDesignation(id);
  }
}
