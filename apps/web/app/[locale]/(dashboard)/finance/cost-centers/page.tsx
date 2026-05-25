"use client";

import { useState } from "react";
import { Table, Button, Card, Row, Col, Select, Space, Statistic, DatePicker } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetCostCentersQuery, useGetCostCenterPLQuery } from "@/store/api/financeApi";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function CostCenters() {
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf("year"), dayjs()]);
  const { data: costCenters } = useGetCostCentersQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { data: plData, isLoading } = useGetCostCenterPLQuery({
      id: selectedId!,
      startDate: dates[0].toISOString(),
      endDate: dates[1].toISOString()
  }, { skip: !selectedId });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Cost Center Analysis"
        subtitle="Departmental and project-based financial reporting"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Cost Centers" },
        ]}
        extra={
            <Space>
                <RangePicker value={dates} onChange={(d: any) => setDates(d)} />
                <Select
                    placeholder="Select Cost Center"
                    style={{ width: 250 }}
                    value={selectedId}
                    onChange={setSelectedId}
                >
                    {costCenters?.map(cc => <Option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</Option>)}
                </Select>
                <Button icon={<PrinterOutlined />}>Print Report</Button>
            </Space>
        }
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
              <Card>
                  <Statistic title="Cost Center Revenue" value={plData?.revenue || 0} precision={2} prefix="$" />
              </Card>
          </Col>
          <Col span={8}>
              <Card>
                  <Statistic title="Cost Center Expenses" value={plData?.expenses || 0} precision={2} prefix="$" valueStyle={{ color: '#cf1322' }} />
              </Card>
          </Col>
          <Col span={8}>
              <Card>
                  <Statistic title="Net Profit/Loss" value={(plData?.revenue || 0) - (plData?.expenses || 0)} precision={2} prefix="$" />
              </Card>
          </Col>
      </Row>

      <Card title="P&L Details" size="small" styles={{ body: { padding: 0 } }}>
          <Table
              dataSource={plData?.details}
              loading={isLoading}
              rowKey="accountId"
              pagination={false}
              columns={[
                  { title: "Account", dataIndex: "accountName" },
                  { title: "Type", dataIndex: "type" },
                  { title: "Amount", dataIndex: "amount", align: 'right', render: (val) => formatCurrency(val) },
              ]}
          />
      </Card>
    </div>
  );
}
