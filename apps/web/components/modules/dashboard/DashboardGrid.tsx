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
import { HolderOutlined } from "@ant-design/icons";
import { useGetPreferencesQuery, useSetPreferenceMutation } from "@/store/api/usersApi";
import { Spin } from "antd";

interface WidgetProps {
  id: string;
  children: React.ReactNode;
}

function SortableWidget({ id, children }: WidgetProps) {
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
  );
}

const DEFAULT_LAYOUT = ["kpis", "charts", "activity"];

export function DashboardGrid() {
  const { data: preferences, isLoading: isPrefsLoading } = useGetPreferencesQuery();
  const [setPreference] = useSetPreferenceMutation();
  const [items, setItems] = useState<string[]>(DEFAULT_LAYOUT);

  useEffect(() => {
    if (preferences?.dashboard_layout) {
      setItems(preferences.dashboard_layout);
    }
  }, [preferences]);

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
        await setPreference({ key: "dashboard_layout", value: newItems }).unwrap();
      } catch (err) {
        // Silently fail or log
      }
    }
  }

  const renderWidget = (id: string) => {
    switch (id) {
      case "kpis":
        return <KpiCards />;
      case "charts":
        return <AnalyticsCharts />;
      case "activity":
        return <ActivityFeed />;
      default:
        return null;
    }
  };

  if (isPrefsLoading) {
    return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => (
          <SortableWidget key={id} id={id}>
            {renderWidget(id)}
          </SortableWidget>
        ))}
      </SortableContext>
    </DndContext>
  );
}
