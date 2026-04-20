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
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  createProduct(@Body() dto: any) {
    return this.inventoryService.createProduct(dto);
  }

  @Get('products')
  findAllProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAllProducts(
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
  }

  @Get('products/:id')
  findProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findProductById(id);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.inventoryService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.removeProduct(id);
  }

  @Post('warehouses')
  createWarehouse(@Body() dto: any) {
    return this.inventoryService.createWarehouse(dto);
  }

  @Get('warehouses')
  findAllWarehouses() {
    return this.inventoryService.findAllWarehouses();
  }

  @Get('warehouses/:id')
  findWarehouse(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findWarehouseById(id);
  }

  @Patch('warehouses/:id')
  updateWarehouse(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.inventoryService.updateWarehouse(id, dto);
  }

  @Delete('warehouses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeWarehouse(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.removeWarehouse(id);
  }
}
