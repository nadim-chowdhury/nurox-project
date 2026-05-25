import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportTemplate } from './entities/report-template.entity';
import { PdfService } from '../system/pdf.service';
import * as ExcelJS from 'exceljs';
import * as csvStringify from 'csv-stringify/sync';
import { Readable } from 'stream';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportTemplate)
    private readonly templateRepo: Repository<ReportTemplate>,
    private readonly dataSource: DataSource,
    private readonly pdfService: PdfService,
  ) {}

  async createTemplate(tenantId: string, userId: string, dto: any) {
    const template = this.templateRepo.create({
      ...dto,
      tenantId,
      createdByUserId: userId,
    });
    return this.templateRepo.save(template);
  }

  async findAllTemplates(tenantId: string) {
    return this.templateRepo.find({ where: { tenantId } });
  }

  async executeReport(
    tenantId: string,
    templateId: string,
    customFilters?: any[],
  ) {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, tenantId },
    });
    if (!template) throw new Error('Report template not found');

    const queryBuilder = this.dataSource
      .getRepository(template.entityName)
      .createQueryBuilder('entity');

    queryBuilder.where('entity.tenant_id = :tenantId', { tenantId });

    // Handle Joins
    if (template.config.joins) {
      template.config.joins.forEach((join, index) => {
        const alias = `join_${index}`;
        queryBuilder.leftJoin(join.entity, alias, join.condition);
      });
    }

    // Handle Filters
    const allFilters = [
      ...(template.config.filters || []),
      ...(customFilters || []),
    ];
    allFilters.forEach((filter, index) => {
      const paramName = `param${index}`;
      queryBuilder.andWhere(
        `entity.${filter.key} ${filter.operator} :${paramName}`,
        { [paramName]: filter.value },
      );
    });

    // Handle Aggregations and Grouping
    if (template.config.grouping && template.config.grouping.length > 0) {
      const selectArgs = template.config.grouping.map((g) => `entity.${g}`);

      if (template.config.aggregations) {
        template.config.aggregations.forEach((agg) => {
          selectArgs.push(
            `${agg.type}(entity.${agg.key}) AS ${agg.key}_${agg.type.toLowerCase()}`,
          );
        });
      }

      queryBuilder.select(selectArgs.join(', '));

      template.config.grouping.forEach((g) => {
        queryBuilder.addGroupBy(`entity.${g}`);
      });

      const rawData = await queryBuilder.getRawMany();
      return { columns: template.config.columns, data: rawData };
    }

    // Handle Sorting
    if (template.config.sorting) {
      template.config.sorting.forEach((sort) => {
        queryBuilder.addOrderBy(`entity.${sort.key}`, sort.order);
      });
    }

    const data = await queryBuilder.getMany();
    return {
      columns: template.config.columns,
      data,
    };
  }

  async generatePdf(tenantId: string, templateId: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Use a fixed demo token for now; in a real scenario, this would be a signed JWT
    const token = 'render_token_123';
    const url = `${frontendUrl}/reports/${templateId}/render?token=${token}`;
    return this.pdfService.generatePdfFromUrl(url);
  }

  async exportXlsx(
    tenantId: string,
    templateId: string,
  ): Promise<ExcelJS.Workbook> {
    const reportData = await this.executeReport(tenantId, templateId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    sheet.columns = reportData.columns.map((c) => ({
      header: c.label,
      key: c.key,
      width: 20,
    }));

    // Freeze header
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    reportData.data.forEach((row: any) => {
      sheet.addRow(row);
    });

    // Optional: add summary row based on aggregations if needed
    // ...

    return workbook;
  }

  async exportCsv(
    tenantId: string,
    templateId: string,
  ): Promise<StreamableFile> {
    const reportData = await this.executeReport(tenantId, templateId);

    // For large datasets, ideally we would use TypeORM stream() here
    // const stream = await queryBuilder.stream();
    // But since executeReport returns fully resolved data for now, we'll stream that array.

    const csvContent = csvStringify.stringify(reportData.data, {
      header: true,
      columns: reportData.columns.map((c) => ({ key: c.key, header: c.label })),
    });

    const stream = Readable.from([csvContent]);
    return new StreamableFile(stream);
  }
}
