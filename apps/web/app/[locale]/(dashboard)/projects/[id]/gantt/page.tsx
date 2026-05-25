'use client';
import { useState, useEffect } from 'react';
import { Typography, Spin, Space, Button, Select } from 'antd';
import { useParams } from 'next/navigation';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { PageHeader } from '@/components/common/PageHeader';
import { ExportOutlined } from '@ant-design/icons';
import './gantt-overrides.css'; // Create this if necessary to override gantt-task-react colors

const { Title, Text } = Typography;

export default function ProjectGanttPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  useEffect(() => {
    // Mock data for Gantt chart
    const currentDate = new Date();
    const mockTasks: Task[] = [
      {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        name: 'Design DB Schema',
        id: '1',
        type: 'task',
        progress: 100,
        isDisabled: true,
        styles: { 
          progressColor: 'var(--color-success)', 
          progressSelectedColor: '#34a355',
          backgroundColor: 'rgba(109, 213, 140, 0.2)',
          backgroundSelectedColor: 'rgba(109, 213, 140, 0.3)'
        },
      },
      {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        name: 'Implement API Endpoints',
        id: '2',
        type: 'task',
        progress: 40,
        dependencies: ['1'],
        styles: { 
          progressColor: 'var(--color-primary)', 
          progressSelectedColor: '#00e5ff',
          backgroundColor: 'rgba(195, 245, 255, 0.2)',
          backgroundSelectedColor: 'rgba(195, 245, 255, 0.3)'
        },
      },
      {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        name: 'Frontend Integration',
        id: '3',
        type: 'task',
        progress: 0,
        dependencies: ['2'],
        styles: { 
          progressColor: 'var(--color-primary)', 
          progressSelectedColor: '#00e5ff',
          backgroundColor: 'rgba(195, 245, 255, 0.2)',
          backgroundSelectedColor: 'rgba(195, 245, 255, 0.3)'
        },
      },
    ];
    setTasks(mockTasks);
    setLoading(false);
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Project Timeline"
        subtitle="Interactive Gantt chart for scheduling"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Timeline" },
        ]}
        extra={
          <Space>
            <Select 
              value={viewMode} 
              onChange={setViewMode}
              style={{ width: 120 }}
              options={[
                { value: ViewMode.Day, label: 'Day' },
                { value: ViewMode.Week, label: 'Week' },
                { value: ViewMode.Month, label: 'Month' },
              ]}
              dropdownStyle={{ background: 'var(--color-surface-high)' }}
            />
            <Button icon={<ExportOutlined />} style={{ background: 'var(--color-surface)', borderColor: 'var(--ghost-border)', color: 'var(--color-on-surface)' }}>
              Export PDF
            </Button>
          </Space>
        }
      />
      
      <div style={{
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--ghost-border)', 
        borderRadius: '8px',
        padding: '24px',
        marginTop: '24px',
        overflow: 'hidden'
      }}>
        {tasks.length > 0 && (
          <div className="gantt-container" style={{ 
            // We can inject CSS variables to style the gantt chart internals to match Dark Mode
            '--gantt-text-color': 'var(--color-on-surface)',
            '--gantt-grid-color': 'var(--ghost-border)',
            '--gantt-header-background': 'var(--color-surface-low)',
          } as React.CSSProperties}>
            <Gantt
              tasks={tasks}
              viewMode={viewMode}
              onDateChange={(task, children) => console.log('Date changed:', task)}
              onProgressChange={(task, children) => console.log('Progress changed:', task)}
              columnWidth={viewMode === ViewMode.Month ? 150 : 60}
              listCellWidth="155px"
              barCornerRadius={4}
              handleWidth={8}
            />
          </div>
        )}
      </div>
    </div>
  );
}
