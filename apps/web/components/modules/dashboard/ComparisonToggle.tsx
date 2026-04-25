"use client";

import React from "react";
import { Switch, Space, Typography } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const { Text } = Typography;

interface Props {
  checked: boolean;
}

export function ComparisonToggle({ checked }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (val: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("compare", "true");
    } else {
      params.delete("compare");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Space size="large">
      <Space>
        <Text style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>Comparison Mode:</Text>
        <Switch checked={checked} onChange={onChange} size="small" />
      </Space>
    </Space>
  );
}
