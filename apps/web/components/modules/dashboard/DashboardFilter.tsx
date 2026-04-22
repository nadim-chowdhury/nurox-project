"use client";

import React from "react";
import { DatePicker, Space, Typography } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Props {
  value: [dayjs.Dayjs, dayjs.Dayjs];
  onChange: (dates: [dayjs.Dayjs, dayjs.Dayjs]) => void;
}

export function DashboardFilter({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Space size="middle">
        <Text style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>Time Period:</Text>
        <RangePicker 
          value={value}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              onChange([dates[0], dates[1]]);
            }
          }}
          presets={[
            { label: 'Last 7 Days', value: [dayjs().subtract(7, 'd'), dayjs()] },
            { label: 'Last 30 Days', value: [dayjs().subtract(30, 'd'), dayjs()] },
            { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            { label: 'Last Quarter', value: [dayjs().subtract(1, 'quarter').startOf('quarter'), dayjs().subtract(1, 'quarter').endOf('quarter')] },
          ]}
          style={{ 
            background: 'var(--color-surface-container-low)', 
            border: '1px solid var(--ghost-border)',
            borderRadius: 4
          }}
        />
      </Space>
    </div>
  );
}
