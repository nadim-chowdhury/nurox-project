'use client';
import { useState } from 'react';
import { Modal, Form, Input, Select, Button, Space, Typography } from 'antd';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import './TaskEditor.css'; // Adding this to style tiptap internals if needed later

const { Text } = Typography;

interface TaskEditorProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function TaskEditor({ visible, onCancel, onSave, initialData }: TaskEditorProps) {
  const [form] = Form.useForm();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.description || '<p>Enter task description here...</p>',
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        description: editor?.getHTML(),
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  return (
    <Modal
      title={<span className="font-display" style={{ fontSize: '18px', color: 'var(--color-on-surface)' }}>{initialData ? "Edit Task" : "New Task"}</span>}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      width={700}
      className="glassmorphic-modal"
      styles={{
        body: {
          background: 'transparent',
        },
        header: {
          background: 'transparent',
          borderBottom: '1px solid var(--ghost-border)',
          paddingBottom: '16px',
          marginBottom: '24px'
        }
      }}
      okButtonProps={{ type: 'primary', className: 'ant-btn-primary' }}
      cancelButtonProps={{ style: { background: 'transparent', borderColor: 'var(--ghost-border)', color: 'var(--color-on-surface)' } }}
    >
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-lowest)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--ghost-border)' }}>
        <Text style={{ color: 'var(--color-on-surface-variant)' }}>Track Time:</Text>
        <Button 
          type={isTimerRunning ? "default" : "primary"}
          className={isTimerRunning ? "animate-pulse-glow" : "ant-btn-primary"}
          style={isTimerRunning ? { 
            background: 'transparent', 
            borderColor: 'var(--color-warning)', 
            color: 'var(--color-warning)',
            fontWeight: 600
          } : {}}
          icon={isTimerRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={toggleTimer}
        >
          {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={initialData}>
        <Form.Item name="title" label={<span style={{ color: 'var(--color-on-surface)' }}>Task Title</span>} rules={[{ required: true }]}>
          <Input 
            placeholder="E.g., Implement login form" 
            style={{ 
              background: 'var(--color-surface)', 
              borderColor: 'var(--ghost-border)', 
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-body)'
            }} 
          />
        </Form.Item>

        <Form.Item label={<span style={{ color: 'var(--color-on-surface)' }}>Description</span>}>
          <div 
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--ghost-border)', 
              borderRadius: '6px', 
              padding: '12px', 
              minHeight: '150px',
              color: 'var(--color-on-surface)',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--ghost-border)'}
          >
            <EditorContent editor={editor} />
          </div>
        </Form.Item>

        <Space style={{ display: 'flex', width: '100%', gap: '16px' }}>
          <Form.Item name="priority" label={<span style={{ color: 'var(--color-on-surface)' }}>Priority</span>} initialValue="MEDIUM" style={{ flex: 1 }}>
            <Select
              dropdownStyle={{ background: 'var(--color-surface-high)' }}
            >
              <Select.Option value="LOW">Low</Select.Option>
              <Select.Option value="MEDIUM">Medium</Select.Option>
              <Select.Option value="HIGH">High</Select.Option>
              <Select.Option value="CRITICAL">Critical</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label={<span style={{ color: 'var(--color-on-surface)' }}>Status</span>} initialValue="NOT_STARTED" style={{ flex: 1 }}>
            <Select
              dropdownStyle={{ background: 'var(--color-surface-high)' }}
            >
              <Select.Option value="NOT_STARTED">Not Started</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="IN_REVIEW">In Review</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}
