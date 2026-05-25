'use client';
import { useState, useMemo } from 'react';
import { Typography, Table, Space, Button, Row, Col, Skeleton, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { ToolOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/common/KpiCard';
import { useGetAssetsQuery, useLogMaintenanceMutation } from '@/store/api/assetsApi';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function MaintenancePage() {
  const { data: assets = [], isLoading, refetch } = useGetAssetsQuery({});
  const [logMaintenance, { isLoading: isLogging }] = useLogMaintenanceMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Flatten maintenance logs from all assets
  const logs = useMemo(() => {
    const allLogs: any[] = [];
    assets.forEach((asset: any) => {
      if (asset.maintenances) {
        asset.maintenances.forEach((maint: any) => {
          allLogs.push({
            ...maint,
            assetName: asset.name,
            assetId: asset.id,
            status: maint.completedDate ? 'COMPLETED' : 'PENDING'
          });
        });
      }
    });
    return allLogs.sort((a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime());
  }, [assets]);

  const activeWorkOrders = logs.filter(l => l.status === 'PENDING').length;

  const handleCreateWorkOrder = async (values: any) => {
    try {
      await logMaintenance({
        id: values.assetId,
        data: {
          maintenanceDate: values.maintenanceDate.toISOString(),
          technicianName: values.technicianName,
          description: values.description,
          cost: Number(values.cost || 0),
          downtimeHours: Number(values.downtimeHours || 0)
        }
      }).unwrap();
      message.success('Maintenance work order created');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error('Failed to create work order');
    }
  };

  const columns = [
    {
      title: 'Asset',
      dataIndex: 'assetName',
      key: 'asset',
      render: (text: string) => <Text style={{ color: 'var(--color-on-surface)', fontWeight: 500 }}>{text}</Text>
    },
    {
      title: 'Technician',
      dataIndex: 'technicianName',
      key: 'technician',
      render: (text: string) => <Text style={{ color: 'var(--color-on-surface-variant)' }}>{text}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'maintenanceDate',
      key: 'date',
      render: (text: string) => <Text style={{ color: 'var(--color-on-surface)' }}>{new Date(text).toLocaleDateString()}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text style={{ color: 'var(--color-on-surface-variant)' }}>{text}</Text>
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (val: number | string) => <Text className="font-display" style={{ color: 'var(--color-primary)' }}>${Number(val || 0).toFixed(2)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          background: status === 'COMPLETED' ? 'rgba(109, 213, 140, 0.1)' : 'rgba(255, 179, 71, 0.1)', 
          color: status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-warning)',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: 'max-content'
        }}>
          {status === 'COMPLETED' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          {status}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button size="small" type="primary" className="ant-btn-primary" disabled={record.status === 'COMPLETED'}>Complete</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Maintenance Logs"
        subtitle="Track asset repairs, preventive maintenance, and downtime"
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: "Maintenance" },
        ]}
        extra={
          <Button type="primary" className="ant-btn-primary" icon={<ToolOutlined />} onClick={() => setIsModalVisible(true)}>
            New Work Order
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="Active Work Orders" value={activeWorkOrders.toString()} />
          </Skeleton>
        </Col>
        <Col xs={12} sm={8}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="MTTR (Mean Time To Repair)" value="3.0 hrs" />
          </Skeleton>
        </Col>
        <Col xs={12} sm={8}>
          <Skeleton loading={isLoading} active paragraph={{ rows: 1 }} title={false}>
            <KpiCard title="MTBF (Mean Time Between Failures)" value="120 days" />
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
          dataSource={logs} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="nurox-table"
        />
      </div>

      <Modal
        title="New Maintenance Work Order"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="glassmorphic-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorkOrder}>
          <Form.Item name="assetId" label="Asset" rules={[{ required: true }]}>
            <Select placeholder="Select an asset">
              {assets.map((asset: any) => (
                <Option key={asset.id} value={asset.id}>{asset.name} ({asset.assetCode})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="technicianName" label="Technician Name" rules={[{ required: true }]}>
            <Input placeholder="Enter technician name" />
          </Form.Item>
          <Form.Item name="maintenanceDate" label="Maintenance Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cost" label="Estimated Cost ($)">
            <Input type="number" placeholder="0.00" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe the maintenance required..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLogging} block>Create Work Order</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
