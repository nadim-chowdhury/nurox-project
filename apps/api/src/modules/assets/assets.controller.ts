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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';

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
  async createCategory(@Req() req: any, @Body() dto: any) {
    return this.assetsService.createCategory(req.tenantId, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all asset categories' })
  @RequirePermissions(Permission.ADMIN_READ)
  async findAllCategories(@Req() req: any) {
    return this.assetsService.findAllCategories(req.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async createAsset(@Req() req: any, @Body() dto: any) {
    return this.assetsService.createAsset(req.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all assets' })
  @RequirePermissions(Permission.ADMIN_READ)
  async findAllAssets(@Req() req: any, @Query() query: any) {
    return this.assetsService.findAllAssets(req.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details' })
  @RequirePermissions(Permission.ADMIN_READ)
  async findOneAsset(@Req() req: any, @Param('id') id: string) {
    return this.assetsService.findOneAsset(req.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update asset details' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async updateAsset(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.assetsService.updateAsset(req.tenantId, id, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign asset to an employee' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async assignAsset(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.assetsService.assignAsset(req.tenantId, id, dto);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Mark asset as returned' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async returnAsset(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: { returnDate: string },
  ) {
    return this.assetsService.returnAsset(req.tenantId, id, dto.returnDate);
  }

  @Post(':id/maintenance')
  @ApiOperation({ summary: 'Record asset maintenance' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async addMaintenance(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.assetsService.addMaintenance(req.tenantId, id, dto);
  }

  @Post(':id/dispose')
  @ApiOperation({ summary: 'Mark asset as disposed' })
  @RequirePermissions(Permission.ADMIN_WRITE)
  async disposeAsset(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.assetsService.disposeAsset(req.tenantId, id, dto);
  }
}
