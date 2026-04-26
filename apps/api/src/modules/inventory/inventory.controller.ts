import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckModule } from '../../common/guards/module.guard';
import {
  ProductDto,
  ProductVariantDto,
  WarehouseDto,
  ZoneDto,
  RackDto,
  BinDto,
  StockAdjustmentDto,
  stockMovementSchema,
  type StockMovementDto,
} from '@repo/shared-schemas';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@CheckModule('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  createProduct(@Body() dto: ProductDto) {
    return this.inventoryService.createProduct(dto as any);
  }

  @Post('variants')
  @ApiOperation({ summary: 'Create a product variant' })
  createVariant(@Body() dto: ProductVariantDto) {
    return this.inventoryService.createVariant(dto as any);
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: WarehouseDto) {
    return this.inventoryService.createWarehouse(dto as any);
  }

  @Post('zones')
  createZone(@Body() dto: ZoneDto) {
    return this.inventoryService.createZone(dto as any);
  }

  @Post('racks')
  createRack(@Body() dto: RackDto) {
    return this.inventoryService.createRack(dto as any);
  }

  @Post('bins')
  createBin(@Body() dto: BinDto) {
    return this.inventoryService.createBin(dto as any);
  }

  @Post('stock/receive')
  @ApiOperation({ summary: 'Receive stock' })
  receiveStock(@Body() dto: StockMovementDto) {
    const parsed = stockMovementSchema.parse(dto);
    return this.inventoryService.receiveStock(parsed as any);
  }

  @Post('stock/issue')
  @ApiOperation({ summary: 'Issue stock' })
  issueStock(@Body() dto: StockMovementDto) {
    const parsed = stockMovementSchema.parse(dto);
    return this.inventoryService.issueStock(parsed as any);
  }

  @Post('stock/transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses/bins' })
  transferStock(@Body() dto: StockMovementDto) {
    const parsed = stockMovementSchema.parse(dto);
    return this.inventoryService.transferStock(parsed as any);
  }

  @Post('stock/adjust')
  @ApiOperation({ summary: 'Adjust stock manually' })
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
  getAging() {
    return this.inventoryService.getInventoryAging();
  }
}
