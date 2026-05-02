"use client";

import React, { useState } from "react";
import { 
    Card, 
    Form, 
    Input, 
    Button, 
    Switch, 
    Space, 
    message, 
    Row, 
    Col, 
    Typography,
    Divider
} from "antd";
import { 
    SaveOutlined, 
    EyeOutlined, 
    ArrowLeftOutlined,
    GlobalOutlined
} from "@ant-design/icons";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { PageHeader } from "@/components/common/PageHeader";
import { useRouter } from "next/navigation";
import { useCreateHandbookMutation } from "@/store/api/hrApi";

const { Title, Text } = Typography;

export default function HandbookBuilderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [createHandbook, { isLoading }] = useCreateHandbookMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write the handbook content here...',
      }),
    ],
    content: '',
  });

  const handlePublish = async (values: any) => {
    if (!editor?.getHTML()) {
      message.error("Handbook content cannot be empty");
      return;
    }

    try {
      await createHandbook({
        ...values,
        content: editor.getHTML(),
        isActive: true,
        version: 1,
      }).unwrap();
      message.success("Handbook published successfully");
      router.push("/hr");
    } catch {
      message.error("Failed to publish handbook");
    }
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button size="small" onClick={() => editor.chain().focus().toggleBold().run()} type={editor.isActive('bold') ? 'primary' : 'default'}>Bold</Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleItalic().run()} type={editor.isActive('italic') ? 'primary' : 'default'}>Italic</Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}>H1</Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}>H2</Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} type={editor.isActive('bulletList') ? 'primary' : 'default'}>List</Button>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Handbook Builder"
        subtitle="Create and publish company policies and handbooks"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Handbook Builder" },
        ]}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Cancel</Button>
        }
      />

      <Form form={form} layout="vertical" onFinish={handlePublish}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card 
                title={<Space><GlobalOutlined /> Content Editor</Space>}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)', minHeight: 600 }}
            >
              <MenuBar />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ 
                  padding: 12, 
                  border: '1px solid var(--ghost-border)', 
                  borderRadius: 4,
                  minHeight: 400,
                  background: 'rgba(255,255,255,0.01)'
              }}>
                <EditorContent editor={editor} className="tiptap-editor" />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
                title="Handbook Details"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
            >
              <Form.Item name="title" label="Handbook Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Employee Code of Conduct" />
              </Form.Item>
              
              <Form.Item name="category" label="Category" initialValue="GENERAL">
                <Input placeholder="e.g. Legal, Benefits, Culture" />
              </Form.Item>

              <Form.Item name="requireAcknowledgment" label="Require Employee Acknowledgment" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <div style={{ marginTop: 32 }}>
                <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    block 
                    size="large" 
                    htmlType="submit"
                    loading={isLoading}
                >
                    Publish Version 1.0
                </Button>
                <Button 
                    icon={<EyeOutlined />} 
                    block 
                    style={{ marginTop: 12 }}
                >
                    Preview
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>

      <style jsx global>{`
        .tiptap-editor .ProseMirror:focus {
          outline: none;
        }
        .tiptap-editor .ProseMirror {
          min-height: 400px;
          color: var(--color-on-surface);
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
        }
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--color-on-surface-variant);
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor .ProseMirror h1 { font-size: 24px; margin-bottom: 16px; color: var(--color-primary); }
        .tiptap-editor .ProseMirror h2 { font-size: 20px; margin-top: 24px; margin-bottom: 12px; }
        .tiptap-editor .ProseMirror ul { padding-left: 24px; margin-bottom: 16px; }
      `}</style>
    </div>
  );
}
