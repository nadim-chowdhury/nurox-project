import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantProvisioningService } from './tenant-provisioning.service';
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

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}

  @Get('settings')
  async getSettings(@Headers('x-tenant-id') tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: [{ schemaNamespace: tenantId }, { domain: tenantId }],
    });

    if (!tenant) {
      return {
        name: 'Nurox ERP',
        primaryColor: '#00b96b',
        logoUrl: '/logo.png',
      };
    }

    return {
      name: tenant.name,
      primaryColor: tenant.primaryColor,
      logoUrl: tenant.logoUrl || '/logo.png',
    };
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current company profile' })
  async getCompany(@Headers('x-tenant-id') tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: [{ schemaNamespace: tenantId }, { domain: tenantId }],
    });
    return tenant;
  }

  @Patch('company')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company profile' })
  async updateCompany(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: CompanyProfileDto,
  ) {
    const parsed = companyProfileSchema.parse(body);
    const tenant = await this.tenantRepository.findOne({
      where: [{ schemaNamespace: tenantId }, { domain: tenantId }],
    });

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
    const branch = this.branchRepository.create(parsed);
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
    await this.branchRepository.update(id, parsed);
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
}
