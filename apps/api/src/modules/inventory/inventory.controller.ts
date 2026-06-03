import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  UseInterceptors,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckModule } from '../../common/guards/module.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import {
  productSchema,
  productVariantSchema,
  warehouseSchema,
  zoneSchema,
  rackSchema,
  binSchema,
  stockAdjustmentSchema,
  stockMovementSchema,
  type ProductDto,
  type ProductVariantDto,
  type WarehouseDto,
  type ZoneDto,
  type RackDto,
  type BinDto,
  type StockAdjustmentDto,
  type StockMovementDto,
} from '@repo/shared-schemas';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@CheckModule('inventory')
@UseInterceptors(AuditLogInterceptor)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  @ApiOperation({ summary: 'List products' })
  listProducts() {
    return this.inventoryService.findProducts();
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  @UsePipes(new ZodValidationPipe(productSchema))
  createProduct(@Body() dto: ProductDto) {
    return this.inventoryService.createProduct(dto as any);
  }

  @Post('variants')
  @ApiOperation({ summary: 'Create a product variant' })
  @UsePipes(new ZodValidationPipe(productVariantSchema))
  createVariant(@Body() dto: ProductVariantDto) {
    return this.inventoryService.createVariant(dto as any);
  }

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a warehouse' })
  @UsePipes(new ZodValidationPipe(warehouseSchema))
  createWarehouse(@Body() dto: WarehouseDto) {
    return this.inventoryService.createWarehouse(dto as any);
  }

  @Post('zones')
  @ApiOperation({ summary: 'Create a zone' })
  @UsePipes(new ZodValidationPipe(zoneSchema))
  createZone(@Body() dto: ZoneDto) {
    return this.inventoryService.createZone(dto as any);
  }

  @Post('racks')
  @ApiOperation({ summary: 'Create a rack' })
  @UsePipes(new ZodValidationPipe(rackSchema))
  createRack(@Body() dto: RackDto) {
    return this.inventoryService.createRack(dto as any);
  }

  @Post('bins')
  @ApiOperation({ summary: 'Create a bin' })
  @UsePipes(new ZodValidationPipe(binSchema))
  createBin(@Body() dto: BinDto) {
    return this.inventoryService.createBin(dto as any);
  }

  @Post('stock/receive')
  @ApiOperation({ summary: 'Receive stock' })
  @UsePipes(new ZodValidationPipe(stockMovementSchema))
  receiveStock(@Body() dto: StockMovementDto) {
    return this.inventoryService.receiveStock(dto as any);
  }

  @Post('stock/issue')
  @ApiOperation({ summary: 'Issue stock' })
  @UsePipes(new ZodValidationPipe(stockMovementSchema))
  issueStock(@Body() dto: StockMovementDto) {
    return this.inventoryService.issueStock(dto as any);
  }

  @Post('stock/transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses/bins' })
  @UsePipes(new ZodValidationPipe(stockMovementSchema))
  transferStock(@Body() dto: StockMovementDto) {
    return this.inventoryService.transferStock(dto as any);
  }

  @Post('stock/adjust')
  @ApiOperation({ summary: 'Adjust stock manually' })
  @UsePipes(new ZodValidationPipe(stockAdjustmentSchema))
  adjustStock(@Body() dto: StockAdjustmentDto) {
    return this.inventoryService.adjustStock(dto as any);
  }

  @Post('stock/count/start')
  startStockCount(@Body() dto: { warehouseId: string; notes?: string }) {
    return this.inventoryService.startStockCount(dto.warehouseId, dto.notes);
  }

  @Post('stock/count/:id/complete')
  completeStockCount(@Param('id') id: string) {
    return this.inventoryService.completeStockCount(id);
  }

  @Get('stock/levels')
  getStockLevels(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.getStockLevels(productId, warehouseId);
  }

  @Get('stock/alerts')
  checkAlerts() {
    return this.inventoryService.checkReorderPoints();
  }

  @Get('stock/aging')
  getAging(@Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getInventoryAging(warehouseId);
  }

  @Get('stock/valuation')
  @ApiOperation({ summary: 'Get stock valuation report' })
  getStockValuation(@Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getStockValuation(warehouseId);
  }

  @Get('stock/expiry-alerts')
  @ApiOperation({ summary: 'Check batches nearing expiry' })
  getExpiryAlerts() {
    return this.inventoryService.checkExpiryDates();
  }

  @Get('products/:id/barcode')
  @ApiOperation({ summary: 'Generate ZPL barcode for a product' })
  generateBarcode(@Param('id') id: string) {
    return this.inventoryService.generateBarcode(id);
  }
}
