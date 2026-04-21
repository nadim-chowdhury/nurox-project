import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Permission } from '../enums/permissions.enum';

@Entity('roles')
export class Role extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'simple-array' })
  permissions: Permission[];

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;
}
