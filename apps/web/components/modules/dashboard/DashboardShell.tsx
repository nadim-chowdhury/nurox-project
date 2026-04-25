import React from "react";
import { Row, Col } from "antd";
import dayjs from "dayjs";
import { DashboardGrid } from "./DashboardGrid";
import { AlertsPanel } from "./AlertsPanel";
import { DashboardFilter } from "./DashboardFilter";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ComparisonMode } from "./ComparisonMode";
import { ComparisonToggle } from "./ComparisonToggle";

interface Props {
  startDate: string;
  endDate: string;
  showComparison: boolean;
}

export function DashboardShell({ startDate, endDate, showComparison }: Props) {
  const dateRange: [dayjs.Dayjs, dayjs.Dayjs] = [dayjs(startDate), dayjs(endDate)];

  return (
    <>
      <AnnouncementBanner />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <ComparisonToggle checked={showComparison} />
        <DashboardFilter value={dateRange} />
      </div>

      {showComparison && <ComparisonMode dateRange={dateRange} />}
      
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
