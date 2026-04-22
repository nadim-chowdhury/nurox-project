"use client";

import React, { useState } from "react";
import { Row, Col } from "antd";
import dayjs from "dayjs";
import { DashboardGrid } from "./DashboardGrid";
import { AlertsPanel } from "./AlertsPanel";
import { DashboardFilter } from "./DashboardFilter";

export function DashboardShell() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "d"),
    dayjs(),
  ]);

  return (
    <>
      <DashboardFilter value={dateRange} onChange={setDateRange} />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={18}>
          <DashboardGrid dateRange={dateRange} />
        </Col>
        <Col xs={24} xl={6}>
          <AlertsPanel dateRange={dateRange} />
        </Col>
      </Row>
    </>
  );
}
