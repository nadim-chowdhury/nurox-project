"use client";

import { Skeleton, Card, Row, Col } from "antd";

export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div style={{ marginBottom: 32 }}>
        <Skeleton active title={{ width: 200 }} paragraph={{ rows: 0 }} />
        <Skeleton active title={{ width: 350 }} paragraph={{ rows: 0 }} />
      </div>

      {/* KPI cards skeleton */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--ghost-border)",
              }}
            >
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Bottom row skeleton */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--ghost-border)",
            }}
          >
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--ghost-border)",
            }}
          >
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
