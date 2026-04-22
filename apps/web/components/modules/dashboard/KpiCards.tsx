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
import dayjs from "dayjs";

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function KpiCards({ dateRange }: Props) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);
  
  const params = {
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  };

  const { data: kpis, isLoading } = useGetKPIsQuery(params);

  useEffect(() => {
    if (!token) return;
    
    const socket = getSocket(token);
    if (!socket) return;

    socket.on("kpi_update", (updatedKpis) => {
      dispatch(
        analyticsApi.util.updateQueryData("getKPIs", params, (draft) => {
          Object.assign(draft, updatedKpis);
        })
      );
    });

    return () => {
      socket.off("kpi_update");
    };
  }, [token, dispatch, params]);

  const data = [
    {
      title: "Total Employees",
      value: kpis?.totalEmployees || 0,
      icon: <TeamOutlined />,
      color: "var(--color-primary)", // Electric Cyan
    },
    {
      title: "Revenue (Period)",
      value: kpis?.revenueMTD || 0,
      icon: <RiseOutlined />,
      color: "var(--color-success)",
      prefix: "$",
    },
    {
      title: "Pipeline Value",
      value: kpis?.pipelineValue || 0,
      icon: <DollarOutlined />,
      color: "var(--color-primary-fixed-dim)",
      prefix: "$",
    },
    {
      title: "Pending Invoices",
      value: kpis?.pendingInvoices || 0,
      icon: <FileTextOutlined />,
      color: "var(--color-warning)",
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
              <ArrowUpOutlined style={{ color: 'var(--color-success)', fontSize: 10 }} />
              <span style={{ color: 'var(--color-success)', fontSize: 11, fontWeight: 600 }}>+4.4%</span>
              <span style={{ color: 'var(--color-on-surface-variant)', fontSize: 11 }}>vs prev. period</span>
            </div>
            {/* Electric Cyan Accent bottom line */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--color-primary)', opacity: 0.3 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
