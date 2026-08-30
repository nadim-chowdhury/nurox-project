import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Get,
} from '@nestjs/common';
import { PosService } from '../services/pos.service';
import {
  CreatePosSessionDto,
  CreatePosOrderDto,
  createPosSessionSchema,
  createPosOrderSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('pos')
@UseInterceptors(AuditLogInterceptor)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('sessions/current')
  async getCurrentSession(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.posService.findCurrentSession(tenantId, user.id);
  }

  @Get('sessions')
  async getSessions(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.posService.findAllSessions(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('orders')
  async getOrders(
    @CurrentTenant() tenantId: string,
    @Query('sessionId') sessionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.posService.findAllOrders(
      tenantId,
      sessionId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('sessions')
  @UsePipes(new ZodValidationPipe(createPosSessionSchema))
  async openSession(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreatePosSessionDto,
  ) {
    return this.posService.openSession(tenantId, user.id, dto);
  }

  @Post('sessions/:id/close')
  async closeSession(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('closingCash') closingCash: number,
  ) {
    return this.posService.closeSession(tenantId, id, closingCash);
  }

  @Post('orders')
  @UsePipes(new ZodValidationPipe(createPosOrderSchema))
  async createOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePosOrderDto,
  ) {
    return this.posService.createOrder(tenantId, dto);
  }

  @Get('orders/:id/receipt')
  async getReceipt(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    // Stub: Returns HTML for thermal printer
    return `
      <html>
        <body style="width: 80mm; font-family: monospace; font-size: 12px; margin: 0; padding: 10px;">
          <h2 style="text-align: center;">NUROX ERP</h2>
          <p style="text-align: center;">Order #${id}</p>
          <hr />
          <p>Mock Receipt Content</p>
          <hr />
          <p style="text-align: center;">Thank you!</p>
        </body>
      </html>
    `;
  }
}
