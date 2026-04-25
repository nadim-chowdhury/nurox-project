import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Permission } from '../enums/permissions.enum';

@Entity('roles')
export class Role extends TenantBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'simple-array' })
  permissions: Permission[];

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentRoleId: string | null;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentRoleId' })
  parentRole: Role;
}
