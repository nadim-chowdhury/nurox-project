"use client";

import React, { useState } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Select, 
  Badge, 
  Typography, 
  Empty, 
  Spin,
  Space
} from "antd";
import { 
  SearchOutlined, 
  TeamOutlined, 
  MailOutlined, 
  PhoneOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { useGetEmployeesQuery, useGetDepartmentsQuery } from "@/store/api/hrApi";

const { Text, Title } = Typography;

export default function TeamDirectoryPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  const { data: employeesData, isLoading } = useGetEmployeesQuery({
    search: search || undefined,
    departmentId: deptFilter || undefined,
    limit: 100,
  });

  const { data: departments } = useGetDepartmentsQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "success";
      case "ON_LEAVE": return "warning";
      case "SUSPENDED": return "error";
      default: return "default";
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Team Directory"
        subtitle="Find and connect with your colleagues"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "HR", href: "/hr" }, { label: "Directory" }]}
      />

      <Card style={{ marginBottom: 24, background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}>
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Input
              placeholder="Search by name, email or designation..."
              prefix={<SearchOutlined style={{ color: 'var(--color-on-surface-variant)' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filter by Department"
              style={{ width: '100%' }}
              size="large"
              allowClear
              options={departments?.map(d => ({ label: d.name, value: d.id }))}
              onChange={setDeptFilter}
            />
          </Col>
        </Row>
      </Card>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
      ) : (
        <Row gutter={[16, 16]}>
          {employeesData?.data.length ? (
            employeesData.data.map((emp) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
                <Card
                  hoverable
                  style={{ 
                    background: 'var(--color-surface)', 
                    border: '1px solid var(--ghost-border)',
                    height: '100%'
                  }}
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Badge dot status={getStatusColor(emp.status)} offset={[-10, 70]} style={{ width: 12, height: 12 }}>
                      <Avatar src={emp.avatarUrl} name={`${emp.firstName} ${emp.lastName}`} size={80} />
                    </Badge>
                    <Title level={5} style={{ margin: '16px 0 4px', color: 'var(--color-on-surface)' }}>
                      {emp.firstName} {emp.lastName}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                      {emp.designation?.title || 'Team Member'}
                    </Text>
                    {emp.manager && (
                      <div style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>Reports to:</Text>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-primary)' }}>
                          {emp.manager.firstName} {emp.manager.lastName}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                      <Space direction="vertical" size={8} style={{ width: '100%', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <TeamOutlined style={{ color: 'var(--color-primary)', fontSize: 12 }} />
                          <Text style={{ fontSize: 12 }}>{emp.department?.name || 'Unassigned'}</Text>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <MailOutlined style={{ color: 'var(--color-primary)', fontSize: 12 }} />
                          <Text style={{ fontSize: 12 }} copyable>{emp.email}</Text>
                        </div>
                        {emp.phone && (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <PhoneOutlined style={{ color: 'var(--color-primary)', fontSize: 12 }} />
                            <Text style={{ fontSize: 12 }}>{emp.phone}</Text>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <EnvironmentOutlined style={{ color: 'var(--color-primary)', fontSize: 12 }} />
                          <Text style={{ fontSize: 12 }}>Headquarters</Text>
                        </div>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty description="No colleagues found matching your search" />
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}
