import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createAssetSchema,
  updateAssetSchema,
  createAssetCategorySchema,
  assignAssetSchema,
  createAssetMaintenanceSchema,
  disposeAssetSchema,
  type CreateAssetDto,
  type UpdateAssetDto,
  type CreateAssetCategoryDto,
  type AssignAssetDto,
  type CreateAssetMaintenanceDto,
  type DisposeAssetDto,
} from '@repo/shared-schemas';
import { Request } from 'express';

interface TenantRequest extends Request {
  tenantId: string;
}

@ApiTags('Asset Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('assets')
@CheckModule('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('categories')
  @ApiOperation({ summary: 'Create a new asset category' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  @UsePipes(new ZodValidationPipe(createAssetCategorySchema))
  async createCategory(
    @Req() req: TenantRequest,
    @Body() dto: CreateAssetCategoryDto,
  ) {
    return this.assetsService.createCategory(req.tenantId, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all asset categories' })
  @RequirePermissions(Permission.ADMIN_READ)
  async findAllCategories(@Req() req: TenantRequest) {
    return this.assetsService.findAllCategories(req.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  @UsePipes(new ZodValidationPipe(createAssetSchema))
  async createAsset(@Req() req: TenantRequest, @Body() dto: CreateAssetDto) {
    return this.assetsService.createAsset(req.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all assets' })
  @RequirePermissions(Permission.ADMIN_READ)
  async findAllAssets(@Req() req: TenantRequest, @Query() query: any) {
    return this.assetsService.findAllAssets(req.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details' })
  @RequirePermissions(Permission.ADMIN_READ)
  async findOneAsset(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetsService.findOneAsset(req.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update asset details' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  @UsePipes(new ZodValidationPipe(updateAssetSchema))
  async updateAsset(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.updateAsset(req.tenantId, id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign asset to an employee' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  @UsePipes(new ZodValidationPipe(assignAssetSchema))
  async assignAsset(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAssetDto,
  ) {
    return this.assetsService.assignAsset(req.tenantId, id, dto);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Mark asset as returned' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async returnAsset(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { returnDate: string },
  ) {
    return this.assetsService.returnAsset(req.tenantId, id, dto.returnDate);
  }

  @Post(':id/maintenance')
  @ApiOperation({ summary: 'Record asset maintenance' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  @UsePipes(new ZodValidationPipe(createAssetMaintenanceSchema))
  async addMaintenance(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAssetMaintenanceDto,
  ) {
    return this.assetsService.addMaintenance(req.tenantId, id, dto);
  }

  @Post(':id/dispose')
  @ApiOperation({ summary: 'Mark asset as disposed' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  @UsePipes(new ZodValidationPipe(disposeAssetSchema))
  async disposeAsset(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisposeAssetDto,
  ) {
    return this.assetsService.disposeAsset(req.tenantId, id, dto);
  }

  @Post(':id/qr')
  @ApiOperation({ summary: 'Generate QR code for asset' })
  @RequirePermissions(Permission.ADMIN_READ)
  async generateQR(
    @Req() req: TenantRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const qrCodeUrl = await this.assetsService.generateAssetQR(
      req.tenantId,
      id,
    );
    return { qrCodeUrl };
  }

  @Post('import')
  @ApiOperation({ summary: 'Import assets from CSV' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async importAssets(
    @Req() req: TenantRequest,
    @Body() body: { fileData: string },
  ) {
    const buffer = Buffer.from(body.fileData, 'base64');
    return this.assetsService.processCSVImport(req.tenantId, buffer);
  }
}
