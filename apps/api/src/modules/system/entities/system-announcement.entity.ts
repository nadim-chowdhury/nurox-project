import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('system_announcements')
export class SystemAnnouncement extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endsAt: Date;

  @Column({ type: 'simple-array', nullable: true })
  targetRoles: string[]; // empty means all users

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
