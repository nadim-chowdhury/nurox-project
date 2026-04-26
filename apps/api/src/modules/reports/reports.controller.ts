import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('templates')
  @ApiOperation({ summary: 'Create a new report template' })
  @RequirePermissions(Permission.REPORTS_WRITE)
  async createTemplate(@Req() req: any, @Body() dto: any) {
    return this.reportsService.createTemplate(req.tenantId, req.user.id, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List all report templates' })
  @RequirePermissions(Permission.REPORTS_READ)
  async findAllTemplates(@Req() req: any) {
    return this.reportsService.findAllTemplates(req.tenantId);
  }

  @Post('execute/:templateId')
  @ApiOperation({ summary: 'Execute a report' })
  @RequirePermissions(Permission.REPORTS_READ)
  async executeReport(
    @Req() req: any,
    @Param('templateId') templateId: string,
    @Body() body: { filters?: any[] },
  ) {
    return this.reportsService.executeReport(
      req.tenantId,
      templateId,
      body.filters,
    );
  }

  @Get('export/pdf/:templateId')
  @ApiOperation({ summary: 'Export a report to PDF' })
  @RequirePermissions(Permission.REPORTS_READ)
  async exportPdf(
    @Req() req: any,
    @Param('templateId') templateId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.generatePdf(req.tenantId, templateId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }
}
