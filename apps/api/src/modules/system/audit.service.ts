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
    userId: string | null;
    action: string;
    module: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const entry = this.auditRepo.create(data);
    return this.auditRepo.save(entry);
  }

  async findAll(query: {
    userId?: string;
    module?: string;
    limit?: number;
    page?: number;
  }) {
    const { userId, module, limit = 50, page = 1 } = query;
    const qb = this.auditRepo.createQueryBuilder('log');

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
