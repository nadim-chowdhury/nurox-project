import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { SalesOrder } from './sales-order.entity';

export enum DOStatus {
  DRAFT = 'DRAFT',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('delivery_orders')
export class DeliveryOrder extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  doNumber: string;

  @Column({ type: 'uuid' })
  salesOrderId: string;

  @ManyToOne(() => SalesOrder)
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column({ type: 'enum', enum: DOStatus, default: DOStatus.DRAFT })
  status: DOStatus;

  @Column({ type: 'timestamptz', nullable: true })
  deliveryDate: Date | null;

  @OneToMany(() => DeliveryOrderLine, (line) => line.deliveryOrder, { cascade: true })
  lines: DeliveryOrderLine[];
}

@Entity('delivery_order_lines')
export class DeliveryOrderLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  deliveryOrderId: string;

  @ManyToOne(() => DeliveryOrder, (do_order) => do_order.lines)
  @JoinColumn({ name: 'deliveryOrderId' })
  deliveryOrder: DeliveryOrder;

  @Column({ type: 'uuid' })
  soLineId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;
}
