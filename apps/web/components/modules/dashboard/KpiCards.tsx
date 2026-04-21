"use client";

import React, { useEffect } from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { useGetKPIsQuery, analyticsApi } from "@/store/api/analyticsApi";
import { getSocket } from "@/lib/socket";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";

export function KpiCards() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);
  const { data: kpis, isLoading } = useGetKPIsQuery();

  useEffect(() => {
    if (!token) return;
    
    const socket = getSocket(token);
    if (!socket) return;

    socket.on("kpi_update", (updatedKpis) => {
      // Manually update the RTK Query cache
      dispatch(
        analyticsApi.util.updateQueryData("getKPIs", undefined, (draft) => {
          Object.assign(draft, updatedKpis);
        })
      );
    });

    return () => {
      socket.off("kpi_update");
    };
  }, [token, dispatch]);

  const data = [
    {
      title: "Total Employees",
      value: kpis?.totalEmployees || 0,
      icon: <TeamOutlined />,
      color: "#c3f5ff",
    },
    {
      title: "Revenue (MTD)",
      value: kpis?.revenueMTD || 0,
      icon: <RiseOutlined />,
      color: "#6dd58c",
      prefix: "$",
    },
    {
      title: "Pipeline Value",
      value: kpis?.pipelineValue || 0,
      icon: <DollarOutlined />,
      color: "#80d8ff",
      prefix: "$",
    },
    {
      title: "Pending Invoices",
      value: kpis?.pendingInvoices || 0,
      icon: <FileTextOutlined />,
      color: "#ffb347",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {data.map((item) => (
        <Col xs={12} sm={12} lg={6} key={item.title}>
          <Card 
            loading={isLoading}
            style={{ 
              background: 'var(--color-surface)', 
              border: '1px solid var(--ghost-border)',
              borderRadius: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: 16, top: 16, fontSize: 24, color: item.color, opacity: 0.5 }}>
              {item.icon}
            </div>
            <Statistic
              title={<span style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>{item.title}</span>}
              value={item.value}
              prefix={item.prefix}
              valueStyle={{ 
                color: 'var(--color-on-surface)', 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                fontSize: 24
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpOutlined style={{ color: '#6dd58c', fontSize: 10 }} />
              <span style={{ color: '#6dd58c', fontSize: 11, fontWeight: 600 }}>+4.4%</span>
              <span style={{ color: 'var(--color-on-surface-variant)', fontSize: 11 }}>vs last month</span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
