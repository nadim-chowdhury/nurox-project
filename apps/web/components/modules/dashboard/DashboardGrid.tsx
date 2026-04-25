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
import { HolderOutlined } from "@ant-design/icons";
import { useGetDashboardWidgetsQuery, useSaveDashboardWidgetsMutation } from "@/store/api/usersApi";
import { usePermission } from "@/hooks/usePermission";
import { Spin, Row, Col } from "antd";
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

const DEFAULT_LAYOUT = ["kpis", "charts", "tasks", "approvals", "dept_comparison", "activity"];

interface DashboardGridProps {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function DashboardGrid({ dateRange }: DashboardGridProps) {
  const { isAdmin, role } = usePermission();
  const { data: widgets, isLoading: isWidgetsLoading } = useGetDashboardWidgetsQuery();
  const [saveWidgets] = useSaveDashboardWidgetsMutation();
  const [items, setItems] = useState<string[]>(DEFAULT_LAYOUT);

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(newItems);
      
      try {
        const widgetPayload = newItems.map((id, index) => ({
          widgetId: id,
          order: index,
          gridSpan: getWidgetSpan(id),
          isVisible: true
        }));
        await saveWidgets(widgetPayload).unwrap();
      } catch (err) {
        // Silently fail or log
      }
    }
  }

  const renderWidget = (id: string) => {
    switch (id) {
      case "kpis":
        return <KpiCards dateRange={dateRange} />;
      case "charts":
        return <AnalyticsCharts dateRange={dateRange} />;
      case "tasks":
        return <TasksWidget />;
      case "approvals":
        return <ApprovalsWidget />;
      case "dept_comparison":
        return <DepartmentComparison />;
      case "activity":
        return <ActivityFeed dateRange={dateRange} />;
      default:
        return null;
    }
  };

  const getWidgetSpan = (id: string) => {
    if (id === "tasks" || id === "approvals" || id === "dept_comparison") return 12;
    return 24;
  };

  if (isWidgetsLoading) {
    return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  return (
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
  );
}
