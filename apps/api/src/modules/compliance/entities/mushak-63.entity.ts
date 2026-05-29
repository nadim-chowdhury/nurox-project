import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Mushak63Item } from './mushak-63-item.entity';

@Entity('mushak_63_invoices')
export class Mushak63 extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  invoiceNumber: string;

  @Column({ type: 'timestamp' })
  issueDate: Date;

  @Column({ type: 'varchar', length: 255 })
  sellerName: string;

  @Column({ type: 'varchar', length: 20 })
  sellerBin: string;

  @Column({ type: 'text' })
  sellerAddress: string;

  @Column({ type: 'varchar', length: 255 })
  buyerName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  buyerBin: string;

  @Column({ type: 'text' })
  buyerAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vehicleNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBaseAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSdAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVatAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmountInclTax: number;

  @OneToMany(() => Mushak63Item, (item) => item.mushak63, { cascade: true })
  items: Mushak63Item[];
}
