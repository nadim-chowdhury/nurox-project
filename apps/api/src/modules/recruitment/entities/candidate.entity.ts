import { Entity, Column, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Application } from './application.entity';

@Entity('candidates')
export class Candidate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({ type: 'uuid', nullable: true })
  referredById: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  referralBonus: number;

  @Column({ type: 'text', array: true, nullable: true })
  skills: string[] | null;

  @OneToMany(() => Application, (app) => app.candidate)
  applications: Application[];
}
