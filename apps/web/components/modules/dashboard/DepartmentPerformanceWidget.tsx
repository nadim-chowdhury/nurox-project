"use client";

import React from "react";
import { Card } from "antd";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export function DepartmentPerformanceWidget() {
  const data = [
    { subject: 'Productivity', Engineering: 120, Sales: 110, fullMark: 150 },
    { subject: 'Compliance', Engineering: 98, Sales: 130, fullMark: 150 },
    { subject: 'Efficiency', Engineering: 86, Sales: 130, fullMark: 150 },
    { subject: 'Quality', Engineering: 99, Sales: 100, fullMark: 150 },
    { subject: 'Speed', Engineering: 85, Sales: 90, fullMark: 150 },
    { subject: 'Cost', Engineering: 65, Sales: 85, fullMark: 150 },
  ];

  return (
    <Card
      title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Department Performance</span>}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10 }} />
            <PolarRadiusAxis hide />
            <Radar
              name="Engineering"
              dataKey="Engineering"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.5}
            />
            <Radar
              name="Sales"
              dataKey="Sales"
              stroke="var(--color-success)"
              fill="var(--color-success)"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--color-surface-container-high)', 
                border: '1px solid var(--ghost-border)',
                color: 'var(--color-on-surface)'
              }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
