import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseRequest,
  PurchaseRequestStatus,
} from '../entities/purchase-request.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../inventory/entities/product.entity';

@Injectable()
export class SmartProcurementService {
  private readonly logger = new Logger(SmartProcurementService.name);

  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly prRepo: Repository<PurchaseRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  @OnEvent('procurement.suggestion.needed')
  async handleSuggestion(payload: {
    tenantId: string;
    productId: string;
    sku: string;
    name: string;
    currentStock: number;
    predictedDemand: number;
    urgency: string;
  }) {
    this.logger.log(
      `Creating smart procurement suggestion for ${payload.sku} in tenant ${payload.tenantId}`,
    );

    // 1. Find a requester (System user or an Admin)
    const requester = await this.userRepo.findOne({
      where: { tenantId: payload.tenantId, role: 'ADMIN' },
    });

    if (!requester) {
      this.logger.warn(
        `No ADMIN found for tenant ${payload.tenantId}, cannot create PR suggestion`,
      );
      return;
    }

    // 2. Calculate suggested quantity
    const product = await this.productRepo.findOne({
      where: { id: payload.productId },
    });
    if (!product) return;

    let suggestedQty = payload.predictedDemand * 1.2; // 20% safety margin
    if (product.maxStockLevel > 0) {
      suggestedQty = Math.min(
        suggestedQty,
        product.maxStockLevel - payload.currentStock,
      );
    }

    // Ensure it's at least enough to reach reorder point + predicted demand
    suggestedQty = Math.max(
      suggestedQty,
      (product.reorderPoint || 0) +
        payload.predictedDemand -
        payload.currentStock,
    );

    if (suggestedQty <= 0) suggestedQty = 10; // Fallback

    // 3. Create Draft Purchase Request
    const pr = this.prRepo.create({
      tenantId: payload.tenantId,
      prNumber: `AUTO-PR-${payload.sku}-${Date.now()}`,
      requestedById: requester.id,
      departmentId:
        requester.branchId || '00000000-0000-0000-0000-000000000000',
      status: PurchaseRequestStatus.DRAFT,
      notes: `AI-Suggested PR based on low stock and predicted 30-day demand (${payload.predictedDemand.toFixed(0)}). Urgency: ${payload.urgency}.`,
      lines: [
        {
          tenantId: payload.tenantId,
          productId: payload.productId,
          quantity: Math.ceil(suggestedQty),
          estimatedUnitCost: product.basePrice,
          requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    await this.prRepo.save(pr);
    this.logger.log(`Created auto-PR suggestion ${pr.prNumber}`);
  }
}
