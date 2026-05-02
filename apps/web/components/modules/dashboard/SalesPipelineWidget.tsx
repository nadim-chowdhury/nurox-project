"use client";

import React from "react";
import { Card } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

export function SalesPipelineWidget() {
  const data = [
    { stage: 'Leads', value: 400, color: '#c3f5ff' },
    { stage: 'Qualified', value: 300, color: '#80d8ff' },
    { stage: 'Proposal', value: 200, color: '#40c4ff' },
    { stage: 'Negotiation', value: 100, color: '#00b0ff' },
    { stage: 'Closed', value: 50, color: '#0091ea' },
  ];

  return (
    <Card
      title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Sales Pipeline Funnel</span>}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--color-surface-container-high)', 
                border: '1px solid var(--ghost-border)',
                color: 'var(--color-on-surface)'
              }} 
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="value" position="right" style={{ fill: 'var(--color-on-surface)', fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
