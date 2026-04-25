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

  async getDashboard(_startDate?: string, _endDate?: string, managerId?: string) {
    const [
      employeeCount,
      revenueMTD,
      pendingInvoices,
      pipelineValue,
      pipelineStats,
      taskStats,
    ] = await Promise.all([
      this.hrService.getCount(managerId),
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

  async getKPIs(startDate?: string, endDate?: string, managerId?: string) {
    const data = await this.getDashboard(startDate, endDate, managerId);
    return data.kpis;
  }

  async getDepartmentKPIs() {
    // Mock department comparison data
    return [
      { name: 'Engineering', employees: 45, budget: 120000, spend: 115000, tasks: 88 },
      { name: 'Sales', employees: 12, budget: 80000, spend: 92000, tasks: 42 },
      { name: 'HR', employees: 5, budget: 30000, spend: 28000, tasks: 15 },
      { name: 'Finance', employees: 8, budget: 50000, spend: 48000, tasks: 22 },
    ];
  }

  async getComparison(currentStart: string, currentEnd: string, prevStart: string, prevEnd: string) {
    const [current, previous] = await Promise.all([
      this.getKPIs(currentStart, currentEnd),
      this.getKPIs(prevStart, prevEnd),
    ]);

    return {
      current,
      previous,
      delta: {
        totalEmployees: current.totalEmployees - previous.totalEmployees,
        revenueMTD: current.revenueMTD - previous.revenueMTD,
        pendingInvoices: current.pendingInvoices - previous.pendingInvoices,
        pipelineValue: current.pipelineValue - previous.pipelineValue,
      },
    };
  }

  async getHRAnalytics() {
    const totalEmployees = await this.hrService.getCount();
    
    // Mock data for trends
    return {
      totalEmployees,
      turnoverRate: 4.2,
      averageTenure: 2.8,
      genderDiversity: [
        { type: 'Male', value: 65 },
        { type: 'Female', value: 35 },
      ],
      headcountTrend: [
        { month: 'Jan', count: 250 },
        { month: 'Feb', count: 255 },
        { month: 'Mar', count: 268 },
        { month: 'Apr', count: 284 },
      ],
      departmentDistribution: await this.getDepartmentKPIs(),
    };
  }

  async getPerformanceCalibration() {
    // Mock bell curve distribution data
    return [
      { rating: '1', count: 5 },
      { rating: '2', count: 15 },
      { rating: '3', count: 45 },
      { rating: '4', count: 25 },
      { rating: '5', count: 10 },
    ];
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
