"use client";

import React from "react";
import { DatePicker, Space, Typography } from "antd";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

dayjs.extend(quarterOfYear);

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Props {
  value: [dayjs.Dayjs, dayjs.Dayjs];
}

export function DashboardFilter({ value }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", dates[0].toISOString());
      params.set("to", dates[1].toISOString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Space size="middle">
        <Text style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>Time Period:</Text>
        <RangePicker 
          value={value}
          onChange={handleRangeChange}
          presets={[
            { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
            { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
            { label: 'Last 7 Days', value: [dayjs().subtract(7, 'd'), dayjs()] },
            { label: 'Last 30 Days', value: [dayjs().subtract(30, 'd'), dayjs()] },
            { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            { label: 'This Quarter', value: [dayjs().startOf('quarter' as any), dayjs().endOf('quarter' as any)] },
            { label: 'Last Quarter', value: [dayjs().subtract(1, 'quarter' as any).startOf('quarter' as any), dayjs().subtract(1, 'quarter' as any).endOf('quarter' as any)] },
            { label: 'This Year', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
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
