import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('api_keys')
export class ApiKey extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  keyPrefix: string; // first 8 chars or hashed

  @Column({ type: 'varchar', length: 255 })
  keyHash: string; // hashed full key (e.g. bcrypt)

  @Column({ type: 'simple-array', nullable: true })
  scopes: string[]; // e.g. ['READ:USERS', 'WRITE:HR']

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
