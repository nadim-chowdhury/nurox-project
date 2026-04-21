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
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
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
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.hrService.createDepartment(dto);
  }

  @Get('departments')
  findAllDepartments() {
    return this.hrService.findAllDepartments();
  }

  @Get('departments/:id')
  findDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDepartmentById(id);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.hrService.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
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
