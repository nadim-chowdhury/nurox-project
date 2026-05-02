import { Injectable } from '@nestjs/common';
import { HrService } from '../hr/hr.service';
import { FinanceService } from '../finance/finance.service';
import { SalesService } from '../sales/sales.service';
import { ProjectsService } from '../projects/projects.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProcurementService } from '../procurement/procurement.service';
import { AttendanceService } from '../attendance/attendance.service';
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
    private readonly procurementService: ProcurementService,
    private readonly attendanceService: AttendanceService,
  ) {}

  async getDashboard(startDate?: string, endDate?: string, managerId?: string) {
    const [
      employeeCount,
      revenueMTD,
      pendingInvoices,
      pipelineValue,
      pipelineStats,
      taskStats,
      stockAlerts,
      newHires,
      leaveToday,
      openPos,
      attendanceRate,
    ] = await Promise.all([
      this.hrService.getCount(managerId),
      this.financeService.getRevenueMTD(),
      this.financeService.getPendingInvoicesCount(),
      this.salesService.getPipelineValue(),
      this.salesService.getPipelineStats(),
      this.projectsService.getTaskStats(),
      this.inventoryService.checkReorderPoints(),
      this.getNewHires(startDate, endDate),
      this.getLeaveToday(),
      this.getOpenPOs(),
      this.getAttendanceRate(startDate, endDate),
    ]);

    const revenueGrowth = [
      { name: 'Week 1', value: 12000 },
      { name: 'Week 2', value: 18000 },
      { name: 'Week 3', value: 15000 },
      { name: 'Week 4', value: 22000 },
    ];

    const productivity = [
      { name: 'Mon', value: 85 },
      { name: 'Tue', value: 92 },
      { name: 'Wed', value: 78 },
      { name: 'Thu', value: 95 },
      { name: 'Fri', value: 88 },
    ];

    const expenseBreakdown = [
      { name: 'Jan', Salaries: 4000, Marketing: 2400, Operations: 2400 },
      { name: 'Feb', Salaries: 3000, Marketing: 1398, Operations: 2210 },
      { name: 'Mar', Salaries: 2000, Marketing: 9800, Operations: 2290 },
      { name: 'Apr', Salaries: 2780, Marketing: 3908, Operations: 2000 },
    ];

    const salesPerformance = [
      { x: 100, y: 200, z: 200, name: 'Lead A' },
      { x: 120, y: 100, z: 260, name: 'Lead B' },
      { x: 170, y: 300, z: 400, name: 'Lead C' },
      { x: 140, y: 250, z: 280, name: 'Lead D' },
      { x: 150, y: 400, z: 500, name: 'Lead E' },
      { x: 110, y: 280, z: 200, name: 'Lead F' },
    ];

    return {
      kpis: {
        totalEmployees: employeeCount,
        revenueMTD,
        pendingInvoices: pendingInvoices,
        pipelineValue,
        attendanceRate,
      },
      pipelineStats,
      taskStats,
      revenueGrowth,
      productivity,
      expenseBreakdown, // Stacked Bar
      salesPerformance, // Scatter
      stockAlerts,
      newHires,
      leaveToday,
      openPos,
    };
  }

  async getKPIs(startDate?: string, endDate?: string, managerId?: string) {
    const data = await this.getDashboard(startDate, endDate, managerId);
    return data.kpis;
  }

  async getNewHires(startDate?: string, endDate?: string) {
    return [
      {
        id: '1',
        name: 'John Doe',
        role: 'Software Engineer',
        joinDate: '2024-05-01',
      },
      {
        id: '2',
        name: 'Jane Smith',
        role: 'Product Manager',
        joinDate: '2024-05-02',
      },
    ];
  }

  async getLeaveToday() {
    return [
      { id: '1', name: 'Alice Johnson', type: 'Sick Leave' },
      { id: '2', name: 'Bob Brown', type: 'Annual Leave' },
    ];
  }

  async getOpenPOs() {
    return [
      {
        id: '1',
        poNumber: 'PO-12345',
        vendor: 'Tech Corp',
        amount: 5000,
        status: 'SENT',
      },
      {
        id: '2',
        poNumber: 'PO-12346',
        vendor: 'Office Supply',
        amount: 1200,
        status: 'DRAFT',
      },
    ];
  }

  async getAttendanceRate(startDate?: string, endDate?: string) {
    return 94.5;
  }

  async getDepartmentKPIs() {
    return [
      {
        name: 'Engineering',
        employees: 45,
        budget: 120000,
        spend: 115000,
        tasks: 88,
      },
      { name: 'Sales', employees: 12, budget: 80000, spend: 92000, tasks: 42 },
      { name: 'HR', employees: 5, budget: 30000, spend: 28000, tasks: 15 },
      { name: 'Finance', employees: 8, budget: 50000, spend: 48000, tasks: 22 },
    ];
  }

  async getComparison(
    currentStart: string,
    currentEnd: string,
    prevStart: string,
    prevEnd: string,
  ) {
    const [current, previous] = await Promise.all([
      this.getKPIs(currentStart, currentEnd),
      this.getKPIs(prevStart, prevEnd),
    ]);

    return {
      current,
      previous,
      delta: {
        totalEmployees:
          (current.totalEmployees || 0) - (previous.totalEmployees || 0),
        revenueMTD: (current.revenueMTD || 0) - (previous.revenueMTD || 0),
        pendingInvoices:
          (current.pendingInvoices || 0) - (previous.pendingInvoices || 0),
        pipelineValue:
          (current.pipelineValue || 0) - (previous.pipelineValue || 0),
      },
    };
  }

  async getHRAnalytics() {
    const totalEmployees = await this.hrService.getCount();

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
