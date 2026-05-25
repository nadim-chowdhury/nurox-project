"use client";

import React, { useState } from "react";
import { Button, Space, Tag, Layout, Tree, Spin, message, Modal, Upload } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { 
  useGetFoldersQuery, 
  useGetDocumentsQuery, 
  useGetUploadUrlMutation, 
  useCreateDocumentMutation,
  useCreateFolderMutation,
  useGetDownloadUrlQuery,
  useSoftDeleteDocumentMutation,
} from "@/store/api/documentsApi";
import { useRouter } from "next/navigation";

const { Sider, Content } = Layout;

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "application/pdf": <FilePdfOutlined style={{ color: "#ffb4ab" }} />,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": <FileExcelOutlined style={{ color: "#6dd58c" }} />,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": <FileTextOutlined style={{ color: "#80d8ff" }} />,
  "image/png": <FileImageOutlined style={{ color: "#ffb347" }} />,
  "image/jpeg": <FileImageOutlined style={{ color: "#ffb347" }} />,
};

export default function DocumentsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const { data: folders, isLoading: isLoadingFolders } = useGetFoldersQuery();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocumentsQuery(selectedFolderId || undefined);
  
  const [getUploadUrl] = useGetUploadUrlMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [softDelete] = useSoftDeleteDocumentMutation();
  
  const router = useRouter();

  const handleUpload = async () => {
    if (!fileToUpload) return;
    try {
      // 1. Get presigned URL
      const { uploadUrl, key } = await getUploadUrl({
        name: fileToUpload.name,
        type: fileToUpload.type,
        folderId: selectedFolderId || undefined,
      }).unwrap();

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: fileToUpload,
        headers: {
          'Content-Type': fileToUpload.type,
        },
      });

      // 3. Confirm with backend
      await createDocument({
        name: fileToUpload.name,
        type: fileToUpload.name.split('.').pop() || 'unknown',
        folderId: selectedFolderId || undefined,
        fileKey: key,
        fileSize: fileToUpload.size,
        mimeType: fileToUpload.type,
      }).unwrap();

      message.success("Document uploaded successfully");
      setIsUploadModalVisible(false);
      setFileToUpload(null);
    } catch (error) {
      message.error("Failed to upload document");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Document",
      key: "name",
      width: 300,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>
            {TYPE_ICONS[r.type] || <FileTextOutlined />}
          </span>
          <span
            style={{
              color: "var(--color-on-surface)",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {r.name}
          </span>
        </div>
      ),
    },
    {
      title: "Access",
      dataIndex: "accessControl",
      key: "access",
      width: 140,
      render: (v: string) => (
        <Tag
          style={{
            background: "rgba(195,245,255,0.08)",
            color: "#c3f5ff",
            border: "1px solid rgba(195,245,255,0.2)",
            borderRadius: 4,
          }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Version",
      dataIndex: "latestVersionNumber",
      key: "version",
      width: 90,
      render: (v: number) => (
        <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
          v{v}.0
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      render: (d: string) => (
        <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      align: "right" as const,
      render: (_, r) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/documents/${r.id}`)}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => softDelete(r.id)}
            style={{ color: "var(--color-error)" }}
          />
        </Space>
      ),
    },
  ];

  const treeData = [
    {
      title: "All Documents",
      key: "root",
      icon: <FolderOpenOutlined />,
      children: folders?.map(f => ({
        title: f.name,
        key: f.id,
        icon: <FolderOpenOutlined />,
        isLeaf: true,
      })) || [],
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Documents"
        subtitle="Enterprise File Management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Documents" },
        ]}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsUploadModalVisible(true)}
            >
              Upload Document
            </Button>
          </Space>
        }
      />
      
      <Layout style={{ background: 'transparent', gap: 24, marginTop: 24 }}>
        <Sider width={280} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 16 }}>
          {isLoadingFolders ? <Spin /> : (
            <Tree
              showIcon
              defaultExpandAll
              treeData={treeData}
              onSelect={(keys) => setSelectedFolderId(keys[0] === 'root' ? null : keys[0] as string)}
              style={{ background: 'transparent', color: 'var(--color-on-surface)' }}
            />
          )}
        </Sider>
        <Content style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
          <DataTable<any>
            columns={columns}
            dataSource={documents || []}
            rowKey="id"
            loading={isLoadingDocs}
          />
        </Content>
      </Layout>

      <Modal
        title="Upload Document"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onOk={handleUpload}
        okText="Upload"
        okButtonProps={{ disabled: !fileToUpload }}
      >
        <Upload.Dragger
          multiple={false}
          beforeUpload={(file) => {
            setFileToUpload(file);
            return false; // Prevent default upload
          }}
          onRemove={() => setFileToUpload(null)}
          fileList={fileToUpload ? [fileToUpload as any] : []}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ color: 'var(--color-primary)' }} />
          </p>
          <p className="ant-upload-text" style={{ color: 'var(--color-on-surface)' }}>
            Click or drag file to this area to upload
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
}
