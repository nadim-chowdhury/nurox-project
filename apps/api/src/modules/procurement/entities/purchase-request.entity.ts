import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Product } from '../../inventory/entities/product.entity';
import { ProductVariant } from '../../inventory/entities/product-variant.entity';

export enum PurchaseRequestStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONVERTED_TO_RFQ = 'CONVERTED_TO_RFQ',
  CONVERTED_TO_PO = 'CONVERTED_TO_PO',
  CANCELLED = 'CANCELLED',
}

@Entity('purchase_requests')
export class PurchaseRequest extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  prNumber: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ type: 'uuid' })
  requestedById: string;

  @Column({
    type: 'enum',
    enum: PurchaseRequestStatus,
    default: PurchaseRequestStatus.DRAFT,
  })
  status: PurchaseRequestStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEstimatedCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => PurchaseRequestLine, (line) => line.purchaseRequest, {
    cascade: true,
  })
  lines: PurchaseRequestLine[];
}

@Entity('purchase_request_lines')
export class PurchaseRequestLine extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  purchaseRequestId: string;

  @ManyToOne(() => PurchaseRequest, (pr) => pr.lines)
  @JoinColumn({ name: 'purchaseRequestId' })
  purchaseRequest: PurchaseRequest;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedUnitCost: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  requiredDate: Date | null;
}
