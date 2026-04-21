import { Injectable } from '@nestjs/common';
import { HrService } from '../hr/hr.service';
import { FinanceService } from '../finance/finance.service';
import { SalesService } from '../sales/sales.service';
import { ProjectsService } from '../projects/projects.service';
import { InventoryService } from '../inventory/inventory.service';
import { InvoiceStatus } from '../finance/entities/invoice.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly hrService: HrService,
    private readonly financeService: FinanceService,
    private readonly salesService: SalesService,
    private readonly projectsService: ProjectsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async getDashboard() {
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

    return {
      kpis: {
        totalEmployees: employeeCount,
        revenueMTD,
        pendingInvoices,
        pipelineValue,
      },
      pipelineStats,
      taskStats,
    };
  }

  async getKPIs() {
    const data = await this.getDashboard();
    return data.kpis;
  }

  async getAlerts() {
    const alerts: any[] = [];

    // 1. Overdue Invoices
    // We access the repo directly for now as finance service doesn't have a specific method
    const overdueInvoices = await (this.financeService as any).invoiceRepo.find(
      {
        where: { status: InvoiceStatus.OVERDUE },
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
