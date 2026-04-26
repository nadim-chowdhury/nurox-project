"use client";

import React from "react";
import { Card, Row, Col, Statistic, Table, Tag, Typography, Alert, Skeleton } from "antd";
import { 
  DatabaseOutlined, 
  CloudServerOutlined, 
  ThunderboltOutlined, 
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useGetHealthQuery } from "@/store/api/systemApi";

const { Title, Text } = Typography;

export default function SystemHealthPage() {
  const { data, isLoading, isError, refetch } = useGetHealthQuery(undefined, {
    pollingInterval: 30000, // Poll every 30s
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in-up">
        <Title level={3}>System Health</Title>
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Error"
        description="Failed to fetch system health status."
        type="error"
        showIcon
        action={<a onClick={() => refetch()}>Retry</a>}
      />
    );
  }

  const details = data?.details || {};
  const status = data?.status === 'ok';

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>System Health</Title>
          <Text type="secondary">Real-time status of core infrastructure components</Text>
        </div>
        <Tag color={status ? 'success' : 'error'} style={{ padding: '4px 12px', borderRadius: 4, fontWeight: 600 }}>
          {status ? 'SYSTEMS OPERATIONAL' : 'DEGRADED PERFORMANCE'}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="Database Pool"
              value={details.db_pool?.idleConnections || 0}
              suffix={`/ ${details.db_pool?.totalConnections || 0}`}
              prefix={<DatabaseOutlined />}
            />
            <Text type="secondary">Idle vs Total Connections</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="Redis Memory"
              value={details.redis?.usedMemory || 'N/A'}
              prefix={<CloudServerOutlined />}
            />
            <Text type="secondary">Used by cache & queues</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="HR Queue Depth"
              value={details.queues?.hr_queue_depth || 0}
              prefix={<ThunderboltOutlined />}
            />
            <Text type="secondary">Pending background jobs</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="WebSocket Clients"
              value={details.websockets?.activeConnections || 0}
              prefix={<ApiOutlined />}
            />
            <Text type="secondary">Live connected users</Text>
          </Card>
        </Col>
      </Row>

      <Card title="Component Details" style={{ marginTop: 24 }}>
        <Table
          pagination={false}
          dataSource={[
            { key: 'database', name: 'PostgreSQL', status: details.database?.status, info: 'Primary transactional storage' },
            { key: 'redis', name: 'Redis', status: details.redis?.status, info: 'Caching and message broker' },
            { key: 'memory', name: 'Process Memory', status: details.memory_rss?.status, info: 'Node.js RSS usage' },
            { key: 'disk', name: 'Disk Storage', status: details.disk?.status, info: 'Attached block storage' },
          ]}
          columns={[
            { title: 'Component', dataIndex: 'name', key: 'name' },
            { title: 'Description', dataIndex: 'info', key: 'info' },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (s) => (
                <Tag color={s === 'up' ? 'success' : 'error'} icon={s === 'up' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
                  {s === 'up' ? 'Healthy' : 'Unhealthy'}
                </Tag>
              )
            },
          ]}
        />
      </Card>
    </div>
  );
}
