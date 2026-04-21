"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, Badge, Space, Button } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  status: string;
}

const COLUMNS = [
  { id: "APPLIED", title: "Applied" },
  { id: "SCREENED", title: "Screened" },
  { id: "INTERVIEW", title: "Interview" },
  { id: "OFFER", title: "Offer" },
  { id: "HIRED", title: "Hired" },
];

export function AtsKanban({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    const overId = over.id as string;

    // Check if dragging over a column
    const isOverAColumn = COLUMNS.some((col) => col.id === overId);

    if (activeApp && isOverAColumn && activeApp.status !== overId) {
      setApplications((apps) =>
        apps.map((a) => (a.id === active.id ? { ...a, status: overId } : a))
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            applications={applications.filter((a) => a.status === col.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <ApplicationCard
            application={applications.find((a) => a.id === activeId)!}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ id, title, applications }: { id: string; title: string; applications: Application[] }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface-variant)",
        borderRadius: 8,
        width: 280,
        minWidth: 280,
        display: "flex",
        flexDirection: "column",
        padding: 12,
      }}
    >
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
        <Badge count={applications.length} style={{ backgroundColor: "var(--color-primary)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  );
}

function ApplicationCard({ application, isOverlay }: { application: Application; isOverlay?: boolean }) {
  return (
    <Card
      size="small"
      style={{
        cursor: "grab",
        boxShadow: isOverlay ? "0 8px 16px rgba(0,0,0,0.15)" : "none",
        border: "1px solid var(--color-outline-variant)",
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Space>
          <Avatar name={application.candidateName} size={24} />
          <span style={{ fontWeight: 500, fontSize: 13 }}>{application.candidateName}</span>
        </Space>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </div>
      <div style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}>
        {application.jobTitle}
      </div>
    </Card>
  );
}
