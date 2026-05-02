"use client";

import React from "react";
import { Card, List, Avatar, Badge, Empty } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useGetDashboardQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function LeaveTodayWidget({ dateRange }: Props) {
  const { data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });

  const leaveToday = (data as any)?.leaveToday || [];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HomeOutlined style={{ color: 'var(--color-error)' }} />
          <span>On Leave Today</span>
          <Badge count={leaveToday.length} style={{ backgroundColor: 'var(--color-error)' }} />
        </div>
      }
      loading={isLoading}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      {leaveToday.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={leaveToday}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} />}
                title={item.name}
                description={item.type}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Everyone is in today!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
}
