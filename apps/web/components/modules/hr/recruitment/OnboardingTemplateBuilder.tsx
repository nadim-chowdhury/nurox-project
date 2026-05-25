"use client";

import React, { useState } from "react";
import { 
  Card, 
  Button, 
  Space, 
  Input, 
  Select, 
  Switch, 
  Typography, 
  Row, 
  Col, 
  InputNumber,
  message
} from "antd";
import { 
  PlusOutlined, 
  DeleteOutlined, 
  HolderOutlined,
  SaveOutlined
} from "@ant-design/icons";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Text, Title, Paragraph } = Typography;

export interface OnboardingTaskTemplate {
  id: string; // Temporary ID for UI
  title: string;
  description: string;
  daysOffset: number;
  ownerRole: string;
  isRequired: boolean;
}

interface TemplateBuilderProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
}

export function OnboardingTemplateBuilder({ initialData, onSave }: TemplateBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType || "FULL_TIME");
  const [tasks, setTasks] = useState<OnboardingTaskTemplate[]>(
    initialData?.tasks?.map((t: any) => ({ ...t, id: Math.random().toString(36).substr(2, 9) })) || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = () => {
    const newTask: OnboardingTaskTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Task",
      description: "",
      daysOffset: 1,
      ownerRole: "CANDIDATE",
      isRequired: true,
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<OnboardingTaskTemplate>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over?.id);
      setTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleSave = async () => {
    if (!name) {
      message.error("Template name is required");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        name,
        employmentType,
        tasks: tasks.map(({ id, ...rest }) => rest), // Remove temp UI ids
      });
      message.success("Template saved successfully");
    } catch (err) {
      message.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Onboarding Template Configuration" bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Template Name</Text>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Standard Full-time Onboarding"
                size="large"
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Employment Type</Text>
              <Select 
                value={employmentType} 
                onChange={setEmploymentType} 
                style={{ width: "100%", marginTop: 8 }}
                size="large"
              >
                <Select.Option value="FULL_TIME">Full Time</Select.Option>
                <Select.Option value="PART_TIME">Part Time</Select.Option>
                <Select.Option value="CONTRACT">Contract</Select.Option>
                <Select.Option value="INTERN">Intern</Select.Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Tasks & Milestones</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>
          Add Task
        </Button>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {tasks.map((task) => (
              <SortableTask 
                key={task.id} 
                task={task} 
                onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {tasks.length === 0 && (
        <Card style={{ textAlign: "center", padding: 40, border: "1px dashed #d9d9d9" }}>
          <Paragraph type="secondary">No tasks defined for this template yet.</Paragraph>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddTask}>Add your first task</Button>
        </Card>
      )}

      <div style={{ marginTop: 32, textAlign: "right" }}>
        <Button 
          type="primary" 
          size="large" 
          icon={<SaveOutlined />} 
          onClick={handleSave} 
          loading={isSaving}
          style={{ width: 200 }}
        >
          Save Template
        </Button>
      </div>
    </div>
  );
}

function SortableTask({ 
  task, 
  onUpdate, 
  onDelete 
}: { 
  task: OnboardingTaskTemplate; 
  onUpdate: (updates: Partial<OnboardingTaskTemplate>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

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
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <div 
          {...attributes} 
          {...listeners} 
          style={{ cursor: "grab", marginTop: 8, color: "#999" }}
        >
          <HolderOutlined />
        </div>
        
        <div style={{ flex: 1 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Input 
                value={task.title} 
                placeholder="Task Title"
                onChange={(e) => onUpdate({ title: e.target.value })}
                style={{ fontWeight: 600 }}
              />
            </Col>
            <Col span={6}>
              <Space>
                <Text type="secondary">Due Day</Text>
                <InputNumber 
                  min={0} 
                  value={task.daysOffset} 
                  onChange={(v) => onUpdate({ daysOffset: v || 0 })} 
                  style={{ width: 80 }}
                />
              </Space>
            </Col>
            <Col span={6} style={{ textAlign: "right" }}>
              <Button danger type="text" icon={<DeleteOutlined />} onClick={onDelete} />
            </Col>
            
            <Col span={24}>
              <Input.TextArea 
                value={task.description} 
                placeholder="Description / Instructions"
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={2}
              />
            </Col>

            <Col span={24}>
              <Space split={<Text type="secondary">|</Text>}>
                <Space>
                  <Text type="secondary">
Assign To Role:</Text>
                  <Select 
                    value={task.ownerRole} 
                    onChange={(v) => onUpdate({ ownerRole: v })}
                    size="small"
                    style={{ width: 120 }}
                  >
                    <Select.Option value="CANDIDATE">Candidate</Select.Option>
                    <Select.Option value="HR">HR</Select.Option>
                    <Select.Option value="MANAGER">Manager</Select.Option>
                    <Select.Option value="IT">IT</Select.Option>
                  </Select>
                </Space>
                <Space>
                  <Switch 
                    size="small" 
                    checked={task.isRequired} 
                    onChange={(v) => onUpdate({ isRequired: v })} 
                  />
                  <Text type="secondary">
Required</Text>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
}
