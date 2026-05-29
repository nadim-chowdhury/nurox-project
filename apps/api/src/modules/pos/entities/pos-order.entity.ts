import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { PosSession } from './pos-session.entity';
import { Tenant } from '../../system/entities/tenant.entity';

@Entity('pos_orders')
export class PosOrder extends TenantBaseEntity {
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => PosSession)
  @JoinColumn({ name: 'sessionId' })
  session: PosSession;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: ['CASH', 'CARD', 'MOBILE', 'SPLIT'] })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountTendered: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  changeDue: number;

  @Column({ type: 'jsonb' })
  items: any; // { productId, quantity, unitPrice, discount }[]

  @CreateDateColumn()
  createdAt: Date;
}
