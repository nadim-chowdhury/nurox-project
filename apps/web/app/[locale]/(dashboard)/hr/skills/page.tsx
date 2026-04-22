"use client";

import React from "react";
import { Card, Table, Tag, Rate, Spin, Typography } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetSkillMatrixQuery } from "@/store/api/hrApi";

const { Text } = Typography;

export default function SkillMatrixPage() {
  const { data: matrix, isLoading } = useGetSkillMatrixQuery();

  if (isLoading) return <Spin size="large" />;

  // Transform matrix data for table
  // API returns { "Skill Name": [ { employeeName, proficiency }, ... ] }
  // Table columns should be Skill Name and list of employees with their levels
  const columns = [
    {
      title: "Skill",
      dataIndex: "skillName",
      key: "skillName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Employees & Proficiency",
      dataIndex: "employees",
      key: "employees",
      render: (employees: any[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {employees.map((e, i) => (
            <Card key={i} size="small" style={{ width: 200, background: 'var(--color-surface-variant)' }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>{e.employeeName}</div>
              <Rate disabled defaultValue={e.proficiency} style={{ fontSize: 12 }} />
            </Card>
          ))}
        </div>
      ),
    },
  ];

  const dataSource = matrix ? Object.keys(matrix).map(skillName => ({
    key: skillName,
    skillName,
    employees: matrix[skillName],
  })) : [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Skill Matrix"
        subtitle="Organization-wide capability and proficiency mapping"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Skills" },
        ]}
      />

      <Card className="shadow-sm">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Card>
    </div>
  );
}
