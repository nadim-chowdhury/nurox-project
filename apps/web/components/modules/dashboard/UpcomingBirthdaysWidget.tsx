"use client";

import React from "react";
import { Card, List, Avatar } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function UpcomingBirthdaysWidget() {
  const birthdays = [
    { name: 'Sarah Wilson', date: 'May 05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { name: 'Michael Chen', date: 'May 12', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
    { name: 'Emma Davis', date: 'May 20', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiftOutlined style={{ color: '#ff85c0' }} />
          <span>Upcoming Birthdays</span>
        </div>
      }
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <List
        dataSource={birthdays}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={item.name}
              description={item.date}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
