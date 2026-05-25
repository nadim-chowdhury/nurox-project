import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import * as crypto from 'crypto';
import * as ExcelJS from 'exceljs';

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
    correlationId?: string | null;
    durationMs?: number | null;
  }) {
    const entry = this.auditRepo.create(data);

    if (data.action === 'APPROVAL') {
      const secret = process.env.AUDIT_SIGNATURE_SECRET || 'fallback-secret';
      const payload = `${data.tenantId}:${data.userId}:${data.action}:${data.entityType}:${data.entityId}:${Date.now()}`;
      entry.signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    }

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

  async exportLogs(query: {
    tenantId: string;
    userId?: string;
    module?: string;
  }): Promise<ExcelJS.Workbook> {
    const { tenantId, userId, module } = query;
    const qb = this.auditRepo.createQueryBuilder('log');

    qb.where('log.tenantId = :tenantId', { tenantId });
    if (userId) qb.andWhere('log.userId = :userId', { userId });
    if (module) qb.andWhere('log.module = :module', { module });

    qb.orderBy('log.createdAt', 'DESC');
    const logs = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Audit Logs');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Date', key: 'createdAt', width: 25 },
      { header: 'Action', key: 'action', width: 15 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'User ID', key: 'userId', width: 36 },
      { header: 'Entity Type', key: 'entityType', width: 20 },
      { header: 'Entity ID', key: 'entityId', width: 36 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'IP Address', key: 'ipAddress', width: 15 },
    ];

    logs.forEach((log) => {
      sheet.addRow({
        id: log.id,
        createdAt: log.createdAt,
        action: log.action,
        module: log.module,
        userId: log.userId,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        ipAddress: log.ipAddress,
      });
    });

    return workbook;
  }
}
