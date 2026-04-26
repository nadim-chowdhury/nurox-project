import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { AuditService } from './audit.service';
import { StorageService } from './storage.service';
import {
  companyProfileSchema,
  createBranchSchema,
  updateBranchSchema,
  CompanyProfileDto,
  CreateBranchDto,
  UpdateBranchDto,
} from '@repo/shared-schemas';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { Branch } from './entities/branch.entity';
import { TenantModule } from './entities/tenant-module.entity';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(TenantModule)
    private readonly moduleRepository: Repository<TenantModule>,
    private readonly tenantProvisioningService: TenantProvisioningService,
    private readonly auditService: AuditService,
    private readonly storageService: StorageService,
  ) {}

  @Get('upload-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a pre-signed URL for uploading a file' })
  async getUploadUrl(
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
  ) {
    const key = `uploads/${Date.now()}-${fileName}`;
    const url = await this.storageService.getUploadPresignedUrl(
      key,
      contentType,
    );
    return { url, key };
  }

  @Get('settings')
  async getSettings(@Req() req: any) {
    const tenant = req.tenant;

    if (!tenant) {
      return {
        name: 'Nurox ERP',
        primaryColor: '#c3f5ff', // Deep Space light blue default
        logoUrl: '/logo.png',
      };
    }

    return {
      name: tenant.name,
      primaryColor: tenant.primaryColor,
      logoUrl: tenant.logoUrl || '/logo.png',
    };
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all audit logs' })
  async getAuditLogs(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll({
      tenantId: req.tenantId,
      userId,
      module,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current company profile' })
  async getCompany(@Req() req: any) {
    return req.tenant;
  }

  @Patch('company')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company profile' })
  async updateCompany(@Req() req: any, @Body() body: CompanyProfileDto) {
    const parsed = companyProfileSchema.parse(body);
    const tenant = req.tenant;

    if (tenant) {
      Object.assign(tenant, parsed);
      return this.tenantRepository.save(tenant);
    }
  }

  @Get('branches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all branches' })
  async findAllBranches() {
    return this.branchRepository.find({ order: { name: 'ASC' } });
  }

  @Post('branches')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new branch' })
  async createBranch(@Body() body: CreateBranchDto) {
    const parsed = createBranchSchema.parse(body);
    const branch = this.branchRepository.create(parsed as any);
    return this.branchRepository.save(branch);
  }

  @Patch('branches/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a branch' })
  async updateBranch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBranchDto,
  ) {
    const parsed = updateBranchSchema.parse(body);
    await this.branchRepository.update(id, parsed as any);
    return this.branchRepository.findOne({ where: { id } });
  }

  @Delete('branches/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a branch' })
  async removeBranch(@Param('id', ParseUUIDPipe) id: string) {
    await this.branchRepository.delete(id);
    return { success: true };
  }

  @Get('modules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List enabled modules for current tenant' })
  async getModules(@Req() req: any) {
    if (!req.tenantId) return [];
    return this.moduleRepository.find({
      where: { tenantId: req.tenantId, isEnabled: true },
    });
  }
}
