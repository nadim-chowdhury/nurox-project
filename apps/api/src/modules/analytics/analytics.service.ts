import { Injectable } from '@nestjs/common';
import { HrService } from '../hr/hr.service';
import { FinanceService } from '../finance/finance.service';
import { SalesService } from '../sales/sales.service';
import { ProjectsService } from '../projects/projects.service';
import { InventoryService } from '../inventory/inventory.service';
import { InvoiceStatus } from '../finance/entities/invoice.entity';
import { Between } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly hrService: HrService,
    private readonly financeService: FinanceService,
    private readonly salesService: SalesService,
    private readonly projectsService: ProjectsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async getDashboard(startDate?: string, endDate?: string) {
    const [
      employeeCount,
      revenueMTD,
      pendingInvoices,
      pipelineValue,
      pipelineStats,
      taskStats,
    ] = await Promise.all([
      this.hrService.getCount(),
      this.financeService.getRevenueMTD(),
      this.financeService.getPendingInvoicesCount(),
      this.salesService.getPipelineValue(),
      this.salesService.getPipelineStats(),
      this.projectsService.getTaskStats(),
    ]);

    // Mock revenue growth (Area Chart)
    const revenueGrowth = [
      { name: 'Week 1', value: 12000 },
      { name: 'Week 2', value: 18000 },
      { name: 'Week 3', value: 15000 },
      { name: 'Week 4', value: 22000 },
    ];

    // Mock productivity (Line Chart)
    const productivity = [
      { name: 'Mon', value: 85 },
      { name: 'Tue', value: 92 },
      { name: 'Wed', value: 78 },
      { name: 'Thu', value: 95 },
      { name: 'Fri', value: 88 },
    ];

    return {
      kpis: {
        totalEmployees: employeeCount,
        revenueMTD,
        pendingInvoices,
        pipelineValue,
      },
      pipelineStats, // Pie Chart
      taskStats, // Bar Chart
      revenueGrowth, // Area Chart
      productivity, // Line Chart
    };
  }

  async getKPIs(startDate?: string, endDate?: string) {
    const data = await this.getDashboard(startDate, endDate);
    return data.kpis;
  }

  async getAlerts(startDate?: string, endDate?: string) {
    const alerts: any[] = [];

    const where: any = { status: InvoiceStatus.OVERDUE };
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    // 1. Overdue Invoices
    const overdueInvoices = await (this.financeService as any).invoiceRepo.find(
      {
        where,
        take: 5,
        order: { createdAt: 'DESC' },
      },
    );

    overdueInvoices.forEach((inv: any) => {
      alerts.push({
        id: `inv-${inv.id}`,
        type: 'error',
        title: 'Overdue Invoice',
        message: `${inv.invoiceNumber} for ${inv.customerName} is overdue.`,
        createdAt: inv.createdAt,
      });
    });

    return alerts;
  }
}
