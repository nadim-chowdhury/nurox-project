import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('vds_certificates')
export class VdsCertificate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  certificateNumber: string;

  @Column({ type: 'timestamp' })
  issueDate: Date;

  @Column({ type: 'varchar', length: 255 })
  supplierName: string;

  @Column({ type: 'varchar', length: 20 })
  supplierBin: string;

  @Column({ type: 'varchar', length: 100 })
  referenceMushak63No: string;

  @Column({ type: 'timestamp' })
  referenceMushak63Date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  deductedVatAmount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  treasuryChallanNo: string;

  @Column({ type: 'timestamp', nullable: true })
  treasuryChallanDate: Date;
}
