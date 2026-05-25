'use client';
import { useState } from 'react';
import { Typography, Row, Col, Table, Button, Space, Tag, Modal, Upload, message, Skeleton } from 'antd';
import { PlusOutlined, ImportOutlined, MoreOutlined, DesktopOutlined, InboxOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { useRouter } from 'next/navigation';
import { useGetAssetsQuery, useImportAssetsMutation } from '@/store/api/assetsApi';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function AssetsPage() {
  const router = useRouter();
  const { data: assets = [], isLoading, refetch } = useGetAssetsQuery({});
  const [importAssets, { isLoading: isImporting }] = useImportAssetsMutation();
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  // Calculate KPIs
  const totalValue = assets.reduce((sum: number, a: any) => sum + Number(a.purchaseCost || 0), 0);
  const netBookValue = assets.reduce((sum: number, a: any) => sum + Number(a.netBookValue || a.purchaseCost || 0), 0);
  const activeAssets = assets.filter((a: any) => a.status === 'ACTIVE').length;
  const underMaintenance = assets.filter((a: any) => a.status === 'UNDER_MAINTENANCE').length;

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const resultStr = e.target?.result as string;
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
          await importAssets({ fileData: base64Data || '' }).unwrap();
          message.success('Assets imported successfully');
          onSuccess?.("ok");
          setIsImportModalVisible(false);
          refetch();
        };
        reader.onerror = (e) => {
          message.error('File reading failed');
          onError?.(new Error('File reading failed'));
        };
        reader.readAsDataURL(file as Blob);
      } catch (error) {
        message.error('Import failed');
        onError?.(error as Error);
      }
    },
  };

  const columns = [
    {
      title: 'Asset',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            background: 'var(--color-surface-high)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <DesktopOutlined />
          </div>
          <div>
            <Text className="font-display" style={{ color: 'var(--color-on-surface)', fontWeight: 500, display: 'block' }}>{text}</Text>
            <Text style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>{record.assetCode}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text: string) => <Tag color="blue" style={{ background: 'rgba(195, 245, 255, 0.1)', color: 'var(--color-primary)', borderColor: 'rgba(195, 245, 255, 0.3)' }}>{text || 'Uncategorized'}</Tag>
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedEmployee', 'firstName'],
      key: 'assignedTo',
      render: (text: string, record: any) => record.assignedEmployee ? <Text style={{ color: 'var(--color-on-surface)' }}>{`${record.assignedEmployee.firstName} ${record.assignedEmployee.lastName}`}</Text> : <Text type="secondary" italic>Unassigned</Text>
    },
    {
      title: 'Purchase Cost',
      dataIndex: 'purchaseCost',
      key: 'purchaseCost',
      render: (val: number | string) => <Text style={{ color: 'var(--color-on-surface)' }}>${Number(val || 0).toFixed(2)}</Text>
    },
    {
      title: 'Net Book Value',
      dataIndex: 'netBookValue',
      key: 'netBookValue',
      render: (val: number | string, record: any) => <Text className="font-display" style={{ color: 'var(--color-success)', fontWeight: 600 }}>${Number(val || record.purchaseCost || 0).toFixed(2)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'var(--color-on-surface)';
        let bg = 'var(--color-surface-high)';
        if (status === 'ACTIVE') { color = 'var(--color-success)'; bg = 'rgba(109, 213, 140, 0.1)'; }
        if (status === 'UNDER_MAINTENANCE') { color = 'var(--color-warning)'; bg = 'rgba(255, 179, 71, 0.1)'; }
        if (status === 'DISPOSED' || status === 'WRITTEN_OFF') { color = 'var(--color-error)'; bg = 'rgba(255, 180, 171, 0.1)'; }
        
        return (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            background: bg, 
            color: color,
            fontSize: '12px',
            fontWeight: 600
          }}>
            {status?.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          icon={<MoreOutlined style={{ color: 'var(--color-on-surface-variant)' }} />} 
          onClick={(e) => { e.stopPropagation(); router.push(`/assets/${record.id}`); }}
        />
      )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Asset Register"
        subtitle="Manage and track company assets, depreciation, and assignments"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets" },
        ]}
        extra={
          <Space>
            <Button 
              icon={<ImportOutlined />} 
              onClick={() => setIsImportModalVisible(true)}
              style={{ background: 'var(--color-surface)', borderColor: 'var(--ghost-border)', color: 'var(--color-on-surface)' }}>
              Bulk Import
            </Button>
            <Button type="primary" className="ant-btn-primary" icon={<PlusOutlined />}>
              Add Asset
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="Total Asset Value" value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          </Skeleton>
        </Col>
        <Col xs={12} sm={6}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="Net Book Value" value={`$${netBookValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
          </Skeleton>
        </Col>
        <Col xs={12} sm={6}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="Active Assets" value={activeAssets.toString()} />
          </Skeleton>
        </Col>
        <Col xs={12} sm={6}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="Under Maintenance" value={underMaintenance.toString()} />
          </Skeleton>
        </Col>
      </Row>

      <div style={{
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--ghost-border)', 
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Table 
          columns={columns} 
          dataSource={assets} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="nurox-table"
          onRow={(record) => ({
            onClick: () => router.push(`/assets/${record.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </div>

      <Modal
        title="Import Assets (CSV)"
        open={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        footer={null}
        className="glassmorphic-modal"
      >
        <Dragger {...uploadProps} accept=".csv">
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: 'var(--color-primary)' }} />
          </p>
          <p className="ant-upload-text" style={{ color: 'var(--color-on-surface)' }}>Click or drag file to this area to upload</p>
          <p className="ant-upload-hint" style={{ color: 'var(--color-on-surface-variant)' }}>
            Support for a single or bulk upload. Strictly prohibited from uploading company data or other
            banned files.
          </p>
        </Dragger>
      </Modal>
    </div>
  );
}
