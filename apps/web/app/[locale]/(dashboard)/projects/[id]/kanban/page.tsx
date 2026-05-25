'use client';
import { useState, useEffect } from 'react';
import { Typography, Row, Col, Spin, message, Button } from 'antd';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useParams } from 'next/navigation';
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { StatusTag } from '@/components/common/StatusTag';
import { Avatar } from '@/components/common/Avatar';
import { PageHeader } from '@/components/common/PageHeader';

const { Title, Text } = Typography;

export default function ProjectKanbanPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTasks([
      { id: '1', title: 'Setup Database Schema', status: 'NOT_STARTED', priority: 'HIGH', assignees: ['Sarah Ahmed'], dueDate: '2026-05-30' },
      { id: '2', title: 'Create Authentication API', status: 'IN_PROGRESS', priority: 'CRITICAL', assignees: ['James Wilson', 'Michael Chen'], dueDate: '2026-06-02' },
      { id: '3', title: 'Design System Implementation', status: 'IN_REVIEW', priority: 'MEDIUM', assignees: ['Fatima Khan'], dueDate: '2026-05-28' },
    ]);
    setLoading(false);
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      message.success('Task order updated');
    }
  };

  const columns = [
    { key: 'NOT_STARTED', title: 'To Do' },
    { key: 'IN_PROGRESS', title: 'In Progress' },
    { key: 'IN_REVIEW', title: 'In Review' },
    { key: 'COMPLETED', title: 'Completed' },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Kanban Board"
        subtitle="Manage project tasks by status"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Board" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Task
          </Button>
        }
      />
      
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <Row gutter={24} style={{ minHeight: 'calc(100vh - 200px)', marginTop: '24px' }}>
          {columns.map((col) => (
            <Col span={6} key={col.key}>
              <div 
                style={{ 
                  background: 'var(--glass-bg)', 
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid var(--ghost-border)', 
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Text className="font-display" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                    {col.title}
                  </Text>
                  <div style={{ background: 'var(--color-surface-high)', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                    {tasks.filter(t => t.status === col.key).length}
                  </div>
                </div>

                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {tasks.filter(t => t.status === col.key).map((task) => (
                    <div 
                      key={task.id} 
                      style={{ 
                        background: 'var(--color-surface)',
                        border: '1px solid var(--ghost-border)',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        cursor: 'grab',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                        e.currentTarget.style.borderColor = 'rgba(195, 245, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'var(--ghost-border)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <StatusTag status={task.priority.toLowerCase()} />
                      </div>
                      
                      <h4 className="font-display" style={{ color: 'var(--color-on-surface)', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>
                        {task.title}
                      </h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '-8px' }}>
                          {task.assignees.map((name: string) => (
                            <Avatar key={name} name={name} size={24} />
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>
                          <ClockCircleOutlined />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </SortableContext>
              </div>
            </Col>
          ))}
        </Row>
      </DndContext>
    </div>
  );
}
