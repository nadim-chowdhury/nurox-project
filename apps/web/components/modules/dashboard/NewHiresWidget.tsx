"use client";

import React from "react";
import { Card, List, Avatar, Typography, Empty } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useGetDashboardQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

const { Text } = Typography;

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function NewHiresWidget({ dateRange }: Props) {
  const { data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });

  const newHires = (data as any)?.newHires || [];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserAddOutlined style={{ color: 'var(--color-primary)' }} />
          <span>New Hires</span>
        </div>
      }
      loading={isLoading}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      {newHires.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={newHires}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} />}
                title={item.name}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.role}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>Joined: {dayjs(item.joinDate).format('MMM D, YYYY')}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No new hires" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
}
