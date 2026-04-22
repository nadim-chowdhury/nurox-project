import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    tenantId: string;
    userId: string | null;
    action: string;
    module: string;
    description: string;
    entityType?: string;
    entityId?: string;
    oldValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const entry = this.auditRepo.create(data);
    return this.auditRepo.save(entry);
  }

  async findAll(query: {
    tenantId: string;
    userId?: string;
    module?: string;
    limit?: number;
    page?: number;
  }) {
    const { tenantId, userId, module, limit = 50, page = 1 } = query;
    const qb = this.auditRepo.createQueryBuilder('log');

    qb.where('log.tenantId = :tenantId', { tenantId });
    if (userId) qb.andWhere('log.userId = :userId', { userId });
    if (module) qb.andWhere('log.module = :module', { module });

    qb.orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}
