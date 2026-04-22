import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { ReportTemplate } from './entities/report-template.entity';
import { PdfService } from '../system/pdf.service';

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

  async executeReport(tenantId: string, templateId: string, customFilters?: any[]) {
    const template = await this.templateRepo.findOne({ where: { id: templateId, tenantId } });
    if (!template) throw new Error('Report template not found');

    const queryBuilder = this.dataSource.getRepository(template.entityName).createQueryBuilder('entity');
    queryBuilder.where('entity.tenantId = :tenantId', { tenantId });

    const allFilters = [...template.config.filters, ...(customFilters || [])];
    allFilters.forEach((filter, index) => {
      const paramName = `param${index}`;
      queryBuilder.andWhere(`entity.${filter.key} ${filter.operator} :${paramName}`, { [paramName]: filter.value });
    });

    if (template.config.sorting) {
      template.config.sorting.forEach(sort => {
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
    const reportData = await this.executeReport(tenantId, templateId);
    // Simple HTML template for now
    const html = `
      <h1>Report</h1>
      <table border="1">
        <thead>
          <tr>${reportData.columns.map(c => `<th>${c.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${reportData.data.map(row => `
            <tr>${reportData.columns.map(c => `<td>${(row as any)[c.key]}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    `;
    return this.pdfService.generatePdf(html);
  }
}
