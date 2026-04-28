"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Badge, Space, Button, message, Modal } from "antd";
import { MoreOutlined, CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import { Avatar } from "@/components/common/Avatar";
import { useUpdateApplicationStatusMutation } from "@/store/api/recruitmentApi";
import { ApplicationDetails } from "./ApplicationDetails";

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  status: string;
  candidate?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job?: {
    title: string;
  };
}

const COLUMNS = [
  { id: "APPLIED", title: "Applied" },
  { id: "SCREENED", title: "Screened" },
  { id: "INTERVIEW", title: "Interview" },
  { id: "OFFER", title: "Offer" },
  { id: "HIRED", title: "Hired" },
];

export function AtsKanban({ initialApplications }: { initialApplications: any[] }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [updateStatus] = useUpdateApplicationStatusMutation();

  useEffect(() => {
    if (initialApplications) {
      setApplications(initialApplications.map(app => ({
        id: app.id,
        candidateName: app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : "Unknown",
        jobTitle: app.job?.title || "Unknown position",
        status: app.status,
      })));
    }
  }, [initialApplications]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    const overId = over.id as string;

    // Determine if it was dropped on a column or another card
    let newStatus = overId;
    if (!COLUMNS.some(col => col.id === overId)) {
        // Dropped on a card, get its status
        const overApp = applications.find(a => a.id === overId);
        if (overApp) newStatus = overApp.status;
    }

    if (activeApp && activeApp.status !== newStatus) {
        try {
            await updateStatus({ id: activeApp.id, status: newStatus }).unwrap();
            setApplications((apps) =>
                apps.map((a) => (a.id === active.id ? { ...a, status: newStatus } : a))
            );
            message.success(`Candidate moved to ${newStatus}`);
        } catch (err) {
            message.error("Failed to update application status");
        }
    }
    
    setActiveId(null);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              applications={applications.filter((a) => a.status === col.id)}
              onCardClick={setSelectedAppId}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <ApplicationCard
              application={applications.find((a) => a.id === activeId)!}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        open={!!selectedAppId}
        onCancel={() => setSelectedAppId(null)}
        footer={null}
        width={900}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {selectedAppId && <ApplicationDetails id={selectedAppId} onSuccess={() => setSelectedAppId(null)} />}
      </Modal>
    </>
  );
}

function KanbanColumn({ 
  id: _id, 
  title, 
  applications, 
  onCardClick 
}: { 
  id: string; 
  title: string; 
  applications: Application[];
  onCardClick: (id: string) => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface-variant)",
        borderRadius: 12,
        width: 300,
        minWidth: 300,
        display: "flex",
        flexDirection: "column",
        padding: 12,
        minHeight: 500,
      }}
    >
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>{title}</h3>
        <Badge count={applications.length} style={{ backgroundColor: "var(--color-primary)" }} />
      </div>
      
      <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
          {applications.map((app) => (
            <SortableApplicationCard key={app.id} application={app} onClick={() => onCardClick(app.id)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableApplicationCard({ application, onClick }: { application: Application; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={(e) => {
        // Prevent drag listener from blocking click
        if (e.defaultPrevented) return;
        onClick();
    }}>
      <ApplicationCard application={application} />
    </div>
  );
}

function ApplicationCard({ application, isOverlay }: { application: Application; isOverlay?: boolean }) {
  return (
    <Card
      size="small"
      hoverable
      style={{
        cursor: "grab",
        borderRadius: 8,
        boxShadow: isOverlay ? "0 12px 24px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.05)",
        border: isOverlay ? "2px solid var(--color-primary)" : "1px solid var(--color-outline-variant)",
        backgroundColor: "var(--color-surface)",
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Space>
          <Avatar name={application.candidateName} size={28} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>{application.candidateName}</div>
            <div style={{ color: "var(--color-on-surface-variant)", fontSize: 11 }}>{application.jobTitle}</div>
          </div>
        </Space>
        <Button 
            type="text" 
            size="small" 
            icon={<MoreOutlined />} 
            onClick={(e) => {
                e.stopPropagation();
                // Show actions menu
            }}
        />
      </div>
      
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
        {application.status === "INTERVIEW" && (
            <CalendarOutlined style={{ color: "var(--color-primary)", fontSize: 14 }} title="Interview Scheduled" />
        )}
        {application.status === "OFFER" && (
            <FileTextOutlined style={{ color: "#00b96b", fontSize: 14 }} title="Offer Extended" />
        )}
      </div>
    </Card>
  );
}
