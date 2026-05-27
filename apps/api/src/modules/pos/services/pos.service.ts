import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosSession } from '../entities/pos-session.entity';
import { PosOrder } from '../entities/pos-order.entity';
import { CreatePosSessionDto, CreatePosOrderDto } from '@repo/shared-schemas';

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);

  constructor(
    @InjectRepository(PosSession)
    private readonly sessionRepo: Repository<PosSession>,
    @InjectRepository(PosOrder)
    private readonly orderRepo: Repository<PosOrder>,
  ) {}

  async openSession(
    tenantId: string,
    cashierId: string,
    dto: CreatePosSessionDto,
  ) {
    const activeSession = await this.sessionRepo.findOne({
      where: { tenantId, cashierId, status: 'OPEN' },
    });

    if (activeSession) {
      throw new BadRequestException('Cashier already has an open POS session');
    }

    const session = this.sessionRepo.create({
      tenantId,
      cashierId,
      openingFloat: dto.openingFloat,
      openedAt: new Date(),
      status: 'OPEN',
    });

    return this.sessionRepo.save(session);
  }

  async closeSession(tenantId: string, sessionId: string, closingCash: number) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, tenantId },
    });
    if (!session || session.status === 'CLOSED') {
      throw new NotFoundException('Active session not found');
    }

    session.status = 'CLOSED';
    session.closedAt = new Date();
    session.closingCash = closingCash;

    // In production, we'd calculate theoretical cash = float + cash sales - payouts
    // and flag discrepancies.

    return this.sessionRepo.save(session);
  }

  async createOrder(tenantId: string, dto: CreatePosOrderDto) {
    const session = await this.sessionRepo.findOne({
      where: { id: dto.sessionId, tenantId, status: 'OPEN' },
    });
    if (!session) throw new NotFoundException('Active POS session not found');

    let totalAmount = 0;
    dto.items.forEach((item) => {
      totalAmount += item.quantity * item.unitPrice - item.discount;
    });

    if (dto.amountTendered < totalAmount) {
      throw new BadRequestException(
        'Amount tendered is less than total amount',
      );
    }

    const changeDue = dto.amountTendered - totalAmount;

    const order = this.orderRepo.create({
      tenantId,
      sessionId: session.id,
      totalAmount,
      paymentMethod: dto.paymentMethod,
      amountTendered: dto.amountTendered,
      changeDue,
      items: dto.items,
    });

    await this.orderRepo.save(order);

    // TODO: Deduct Inventory here using event emitter or direct service call

    return order;
  }
}
