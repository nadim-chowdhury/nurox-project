"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Switch,
  List,
  Typography,
  Divider,
  Tag,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  MenuOutlined,
  HolderOutlined,
} from "@ant-design/icons";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Text, Title } = Typography;

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "file";
  required: boolean;
  options?: string[]; // For select type
}

interface FormBuilderProps {
  value?: FormField[];
  onChange?: (fields: FormField[]) => void;
}

export function ApplicationFormBuilder({
  value = [],
  onChange,
}: FormBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: "New Question",
      type: "text",
      required: false,
    };
    const newFields = [...value, newField];
    onChange?.(newFields);
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    const newFields = value.map((f) =>
      f.id === id ? { ...f, ...updates } : f,
    );
    onChange?.(newFields);
  };

  const handleDeleteField = (id: string) => {
    const newFields = value.filter((f) => f.id !== id);
    onChange?.(newFields);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((f) => f.id === active.id);
      const newIndex = value.findIndex((f) => f.id === over?.id);
      onChange?.(arrayMove(value, oldIndex, newIndex));
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Custom Application Questions
        </Title>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddField}
          block
        >
          Add Custom Field
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {value.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                onUpdate={(updates) => handleUpdateField(field.id, updates)}
                onDelete={() => handleDeleteField(field.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {value.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            color: "var(--color-text-secondary)",
          }}
        >
          No custom questions yet. Candidates will only see the default personal
          info and resume fields.
        </div>
      )}
    </div>
  );
}

function SortableField({
  field,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      size="small"
      bodyStyle={{ padding: "12px" }}
      className="form-builder-field"
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          {...attributes}
          {...listeners}
          style={{ cursor: "grab", marginTop: 6, color: "#999" }}
        >
          <HolderOutlined />
        </div>

        <div style={{ flex: 1 }}>
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                value={field.label}
                placeholder="Question Label"
                onChange={(e) => onUpdate({ label: e.target.value })}
                style={{ fontWeight: 600 }}
              />
              <Select
                value={field.type}
                onChange={(v) => onUpdate({ type: v as any })}
                style={{ width: 140 }}
              >
                <Select.Option value="text">Text</Select.Option>
                <Select.Option value="number">Number</Select.Option>
                <Select.Option value="select">Dropdown</Select.Option>
                <Select.Option value="checkbox">Checkbox</Select.Option>
                <Select.Option value="file">File Upload</Select.Option>
              </Select>
            </div>

            {field.type === "select" && (
              <Input
                placeholder="Comma separated options: e.g. Yes, No, Maybe"
                value={field.options?.join(", ")}
                onChange={(e) =>
                  onUpdate({
                    options: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
              />
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <Switch
                  size="small"
                  checked={field.required}
                  onChange={(v) => onUpdate({ required: v })}
                />
                <Text type="secondary">Required Field</Text>
              </Space>
              <Button
                danger
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={onDelete}
              >
                Remove
              </Button>
            </div>
          </Space>
        </div>
      </div>
    </Card>
  );
}
