"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Space, message, Spin, QRCode } from "antd";
import { QrcodeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetCheckInQrQuery } from "@/store/api/attendanceApi";
import { useAppSelector } from "@/hooks/useRedux";

const { Text, Title, Paragraph } = Typography;

export function QRCheckIn() {
  const user = useAppSelector(state => state.auth.user);
  const { data, isLoading, refetch, isFetching } = useGetCheckInQrQuery(user?.id || "", {
    pollingInterval: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) return <Spin />;

  return (
    <Card 
      title={<span><QrcodeOutlined /> My Check-In QR</span>}
      style={{ textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <div style={{ padding: 20, background: 'white', display: 'inline-block', borderRadius: 8, marginBottom: 16 }}>
        <QRCode value={data?.token || "invalid"} size={200} errorLevel="H" />
      </div>
      <Paragraph type="secondary" style={{ fontSize: 12 }}>
        Scan this at the office entrance to check-in/out.<br/>
        Valid for 30 minutes.
      </Paragraph>
      <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
        Refresh Code
      </Button>
    </Card>
  );
}
