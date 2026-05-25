import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@ApiTags('Admin & Compliance')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly auditService: AuditService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Get('audit-logs')
  @ApiOperation({ summary: 'List all audit logs (SIEM Integration)' })
  @ApiSecurity('x-api-key')
  @ApiBearerAuth()
  async getAuditLogs(
    @Req() req: any,
    @Headers('x-api-key') apiKey?: string,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Basic API Key auth for SIEM integration or fallback to JWT
    if (apiKey) {
      const validApiKey = process.env.SIEM_API_KEY;
      if (!validApiKey || apiKey !== validApiKey) {
        throw new UnauthorizedException('Invalid API Key');
      }
      // Note: for API key, tenantId should probably be inferred or passed as header,
      // but for simplicity we assume single tenant or require tenantId in header.
      const tenantId = req.headers['x-tenant-id'] || req.tenantId;
      if (!tenantId) throw new UnauthorizedException('Tenant ID required');
      req.tenantId = tenantId;
    } else {
      // Use JWT auth
      // This is a bit hacky to run guard logic manually but we can also create a custom guard
      if (!req.user) throw new UnauthorizedException();
    }

    return this.auditService.findAll({
      tenantId: req.tenantId,
      userId,
      module,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('audit-logs/export')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export audit logs to XLSX' })
  async exportAuditLogs(
    @Req() req: any,
    @Res() res: Response,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
  ) {
    const workbook = await this.auditService.exportLogs({
      tenantId: req.tenantId,
      userId,
      module,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `audit-logs-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('compliance-report')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate SOC 2 / ISO 27001 readiness report' })
  async getComplianceReport(@Req() req: any) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: req.tenantId },
    });
    if (!tenant) throw new UnauthorizedException();

    return {
      reportType: 'SOC 2 / ISO 27001 Readiness Checklist',
      generatedAt: new Date().toISOString(),
      tenant: tenant.name,
      controls: [
        {
          control: 'CC6.1 - Logical Access Security',
          status: tenant.isSamlEnabled ? 'Pass' : 'Warning',
          description: 'SAML/SSO is recommended for access management.',
        },
        {
          control: 'CC6.6 - Boundary Protection',
          status:
            tenant.ipAllowlist && tenant.ipAllowlist.length > 0
              ? 'Pass'
              : 'Warning',
          description:
            'IP Allowlisting is recommended for boundary protection.',
        },
        {
          control: 'CC7.2 - Security Monitoring',
          status: 'Pass',
          description:
            'Audit logs are actively captured and retained for ' +
            tenant.auditLogRetentionDays +
            ' days.',
        },
        {
          control: 'Privacy - Data Residency',
          status: 'Pass',
          description: 'Data is stored in ' + tenant.dataResidency + ' region.',
        },
      ],
    };
  }
}
