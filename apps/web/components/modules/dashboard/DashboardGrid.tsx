"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KpiCards } from "./KpiCards";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { ActivityFeed } from "./ActivityFeed";
import { TasksWidget } from "./TasksWidget";
import { ApprovalsWidget } from "./ApprovalsWidget";
import { DepartmentComparison } from "./DepartmentComparison";
import { StockAlertsWidget } from "./StockAlertsWidget";
import { NewHiresWidget } from "./NewHiresWidget";
import { LeaveTodayWidget } from "./LeaveTodayWidget";
import { OpenPOsWidget } from "./OpenPOsWidget";
import { RevenueByDeptWidget } from "./RevenueByDeptWidget";
import { InventoryAgingWidget } from "./InventoryAgingWidget";
import { TopProductsWidget } from "./TopProductsWidget";
import { DepartmentPerformanceWidget } from "./DepartmentPerformanceWidget";
import { OverdueInvoicesWidget } from "./OverdueInvoicesWidget";
import { AttendanceRateWidget } from "./AttendanceRateWidget";
import { UpcomingBirthdaysWidget } from "./UpcomingBirthdaysWidget";
import { SalesPipelineWidget } from "./SalesPipelineWidget";
import { ProcurementLeadTimeWidget } from "./ProcurementLeadTimeWidget";
import { ExecutiveSummaryWidget } from "./ExecutiveSummaryWidget";

import { HolderOutlined, PlusOutlined } from "@ant-design/icons";
import { useGetDashboardWidgetsQuery, useSaveDashboardWidgetsMutation } from "@/store/api/usersApi";
import { usePermission } from "@/hooks/usePermission";
import { Spin, Row, Col, Button, Drawer, List, Checkbox } from "antd";
import dayjs from "dayjs";

interface WidgetProps {
  id: string;
  children: React.ReactNode;
  span?: number;
}

function SortableWidget({ id, children, span = 24 }: WidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.6 : 1,
    marginBottom: 24,
    position: 'relative' as const,
  };

  return (
    <Col span={span}>
      <div ref={setNodeRef} style={style}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ 
            position: 'absolute', 
            right: 12, 
            top: 12, 
            cursor: 'grab', 
            zIndex: 10,
            padding: '4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '4px',
            color: 'var(--color-on-surface-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HolderOutlined />
        </div>
        {children}
      </div>
    </Col>
  );
}

const ALL_WIDGETS = [
  { id: "kpis", title: "Key Performance Indicators", span: 24 },
  { id: "charts", title: "Analytics Charts", span: 24 },
  { id: "tasks", title: "My Tasks", span: 12 },
  { id: "approvals", title: "Pending Approvals", span: 12 },
  { id: "dept_comparison", title: "Department Comparison", span: 12, roles: ["ADMIN", "HR_MANAGER", "ACCOUNTANT"] },
  { id: "activity", title: "Recent Activity", span: 24 },
  { id: "stock_alerts", title: "Stock Alerts", span: 12, roles: ["ADMIN", "INVENTORY_MANAGER"] }, // INVENTORY_MANAGER seems logical although not in the list I saw, I'll use ADMIN for now
  { id: "new_hires", title: "New Hires", span: 12, roles: ["ADMIN", "HR_MANAGER"] },
  { id: "leave_today", title: "Leaves Today", span: 12, roles: ["ADMIN", "HR_MANAGER", "PROJECT_MANAGER"] },
  { id: "open_pos", title: "Open Purchase Orders", span: 12, roles: ["ADMIN", "ACCOUNTANT"] },
  { id: "revenue_dept", title: "Budget by Dept", span: 12, roles: ["ADMIN", "ACCOUNTANT"] },
  { id: "inventory_aging", title: "Inventory Aging", span: 12, roles: ["ADMIN"] },
  { id: "top_products", title: "Top Products", span: 12, roles: ["ADMIN", "SALES_REP"] },
  { id: "dept_perf", title: "Dept Performance", span: 12, roles: ["ADMIN", "HR_MANAGER", "PROJECT_MANAGER"] },
  { id: "overdue_inv", title: "Overdue Invoices", span: 12, roles: ["ADMIN", "ACCOUNTANT"] },
  { id: "attendance_rate", title: "Attendance Rate", span: 12, roles: ["ADMIN", "HR_MANAGER", "PROJECT_MANAGER"] },
  { id: "birthdays", title: "Upcoming Birthdays", span: 12 },
  { id: "sales_pipeline", title: "Sales Pipeline", span: 12, roles: ["ADMIN", "SALES_REP"] },
  { id: "procurement_lead", title: "Procurement Lead Time", span: 12, roles: ["ADMIN"] },
  { id: "exec_summary", title: "Executive Summary", span: 12, roles: ["ADMIN"] },
];

const DEFAULT_LAYOUT = ["kpis", "charts", "tasks", "approvals", "activity"];

interface DashboardGridProps {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function DashboardGrid({ dateRange }: DashboardGridProps) {
  const { role } = usePermission();
  const { data: widgets, isLoading: isWidgetsLoading } = useGetDashboardWidgetsQuery();
  const [saveWidgets] = useSaveDashboardWidgetsMutation();
  const [items, setItems] = useState<string[]>(DEFAULT_LAYOUT);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredWidgets = ALL_WIDGETS.filter(w => !w.roles || w.roles.includes(role || ''));

  useEffect(() => {
    if (widgets && widgets.length > 0) {
      setItems(widgets.map(w => w.widgetId));
    }
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const persistWidgets = async (newItems: string[]) => {
    try {
      const widgetPayload = newItems.map((id, index) => ({
        widgetId: id,
        order: index,
        gridSpan: getWidgetSpan(id),
        isVisible: true
      }));
      await saveWidgets(widgetPayload).unwrap();
    } catch (_err) {
      // Silently fail or log
    }
  };

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(newItems);
      await persistWidgets(newItems);
    }
  }

  const toggleWidget = (id: string) => {
    const newItems = items.includes(id) 
      ? items.filter(i => i !== id)
      : [...items, id];
    setItems(newItems);
    persistWidgets(newItems);
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case "kpis": return <KpiCards dateRange={dateRange} />;
      case "charts": return <AnalyticsCharts dateRange={dateRange} />;
      case "tasks": return <TasksWidget />;
      case "approvals": return <ApprovalsWidget />;
      case "dept_comparison": return <DepartmentComparison />;
      case "activity": return <ActivityFeed dateRange={dateRange} />;
      case "stock_alerts": return <StockAlertsWidget dateRange={dateRange} />;
      case "new_hires": return <NewHiresWidget dateRange={dateRange} />;
      case "leave_today": return <LeaveTodayWidget dateRange={dateRange} />;
      case "open_pos": return <OpenPOsWidget dateRange={dateRange} />;
      case "revenue_dept": return <RevenueByDeptWidget />;
      case "inventory_aging": return <InventoryAgingWidget dateRange={dateRange} />;
      case "top_products": return <TopProductsWidget />;
      case "dept_perf": return <DepartmentPerformanceWidget />;
      case "overdue_inv": return <OverdueInvoicesWidget />;
      case "attendance_rate": return <AttendanceRateWidget />;
      case "birthdays": return <UpcomingBirthdaysWidget />;
      case "sales_pipeline": return <SalesPipelineWidget />;
      case "procurement_lead": return <ProcurementLeadTimeWidget />;
      case "exec_summary": return <ExecutiveSummaryWidget />;
      default: return null;
    }
  };

  const getWidgetSpan = (id: string) => {
    const widget = ALL_WIDGETS.find(w => w.id === id);
    return widget?.span || 24;
  };

  if (isWidgetsLoading) {
    return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsDrawerOpen(true)}
          style={{ background: 'var(--color-primary)', border: 'none' }}
        >
          Customize Dashboard
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Row gutter={[24, 0]}>
            {items.map((id) => (
              <SortableWidget key={id} id={id} span={getWidgetSpan(id)}>
                {renderWidget(id)}
              </SortableWidget>
            ))}
          </Row>
        </SortableContext>
      </DndContext>

      <Drawer
        title="Widget Library"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={400}
        styles={{ body: { padding: 0 } }}
      >
        <List
          dataSource={filteredWidgets}
          renderItem={(item) => (
            <List.Item style={{ padding: '12px 24px' }}>
              <Checkbox 
                checked={items.includes(item.id)} 
                onChange={() => toggleWidget(item.id)}
              >
                {item.title}
              </Checkbox>
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
}
