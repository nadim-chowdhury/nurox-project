"use client";

import React from "react";
import { Card, Spin } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useGetDepartmentKPIsQuery } from "@/store/api/analyticsApi";

const COLORS = ["#c3f5ff", "#80d8ff", "#6dd58c", "#ffb347", "#ffb4ab"];

export function RevenueByDeptWidget() {
  const { data, isLoading } = useGetDepartmentKPIsQuery();

  if (isLoading) return <Card loading title="Budget by Department" style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }} />;

  const chartData = data?.map(d => ({ name: d.name, value: d.budget })) || [];

  return (
    <Card
      title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Budget by Department</span>}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'var(--color-surface-container-high)', 
                border: '1px solid var(--ghost-border)',
                color: 'var(--color-on-surface)'
              }} 
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
