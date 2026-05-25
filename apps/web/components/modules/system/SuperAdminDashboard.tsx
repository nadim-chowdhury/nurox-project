"use client";

import React, { useState } from "react";
import {
  Card,
  Switch,
  Statistic,
  Row,
  Col,
  Typography,
  message,
  Button,
} from "antd";
import {
  DatabaseOutlined,
  BugOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

export function SuperAdminDashboard() {
  const [maintenance, setMaintenance] = useState(false);

  const toggleMaintenance = async (checked: boolean) => {
    try {
      await axios.post("/api/superadmin/maintenance", { enabled: checked });
      setMaintenance(checked);
      message.success(
        `Global maintenance mode ${checked ? "enabled" : "disabled"}`,
      );
    } catch (e) {
      message.error("Failed to toggle maintenance mode");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={3}>SaaS Super Admin</Title>
          <Text type="secondary">
            Global system health and tenant management
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Text strong className="text-red-500">
            Maintenance Mode
          </Text>
          <Switch checked={maintenance} onChange={toggleMaintenance} />
        </div>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Tenants"
              value={42}
              prefix={<GlobalOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="DB Pool Usage"
              value={34}
              suffix="%"
              prefix={<DatabaseOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Redis Memory"
              value={120}
              suffix=" MB"
              prefix={<ThunderboltOutlined className="text-yellow-500" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Failed Background Jobs"
              value={2}
              valueStyle={{ color: "#cf1322" }}
              prefix={<BugOutlined />}
            />
            <Button
              type="link"
              size="small"
              className="p-0 mt-2"
              href="/admin/queues"
              target="_blank"
            >
              Open Bull Board
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Table of Tenants would go here */}
    </div>
  );
}
