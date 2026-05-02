"use client";

import React from "react";
import { Card } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useGetDashboardQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

const COLORS = ["#c3f5ff", "#80d8ff", "#6dd58c", "#ffb347", "#ffb4ab"];

export function InventoryAgingWidget({ dateRange }: { dateRange: [dayjs.Dayjs, dayjs.Dayjs] }) {
  const { data: _data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });

  // Mock data for aging buckets
  const agingData = [
    { name: "0-30 Days", count: 150 },
    { name: "31-60 Days", count: 85 },
    { name: "61-90 Days", count: 42 },
    { name: "90+ Days", count: 18 },
  ];

  return (
    <Card
      title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Inventory Aging</span>}
      loading={isLoading}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={agingData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--color-surface-container-high)', 
                border: '1px solid var(--ghost-border)',
                color: 'var(--color-on-surface)'
              }} 
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {agingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
