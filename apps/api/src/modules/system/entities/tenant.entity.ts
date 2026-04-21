import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants', schema: 'public' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 63, unique: true })
  schemaNamespace: string; // The Postgres schema name (e.g. 'tenant_acme')

  @Column({ type: 'varchar', length: 255, unique: true })
  domain: string; // e.g. 'acme.nurox.app'

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 7, default: '#00b96b' })
  primaryColor: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
