"use client";

import { Card, Row, Col, Statistic, Table } from "antd";
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  FileTextOutlined, 
  BankOutlined,
  BookOutlined
} from "@ant-design/icons";
import { useGetInvoicesQuery, useGetAccountsQuery } from "@/store/api/financeApi";

export default function FinanceDashboard() {
  const { data: invoices } = useGetInvoicesQuery({ page: 1, limit: 5 });
  const { data: accounts } = useGetAccountsQuery();

  const totalRevenue = accounts
    ?.filter(a => a.type === "REVENUE")
    .reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  const totalExpense = accounts
    ?.filter(a => a.type === "EXPENSE")
    .reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  const cashBalance = accounts
    ?.filter(a => a.code.startsWith("10"))
    .reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue (YTD)"
              value={totalRevenue}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Expenses (YTD)"
              value={totalExpense}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Net Income"
              value={totalRevenue - totalExpense}
              precision={2}
              valueStyle={{ color: totalRevenue - totalExpense >= 0 ? '#3f8600' : '#cf1322' }}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cash on Hand"
              value={cashBalance}
              precision={2}
              prefix={<BankOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Recent Invoices" extra={<a href="/finance/invoices">View All</a>}>
            <Table
              dataSource={invoices?.data}
              pagination={false}
              rowKey="id"
              columns={[
                { title: "Invoice #", dataIndex: "invoiceNumber" },
                { title: "Customer", dataIndex: "customerName" },
                { title: "Amount", dataIndex: "totalAmount", render: (val) => `$${val}` },
                { title: "Status", dataIndex: "status" },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              <Card hoverable className="text-center cursor-pointer" onClick={() => window.location.href='/finance/journals'}>
                <BookOutlined className="text-2xl mb-2" />
                <div>New Journal</div>
              </Card>
              <Card hoverable className="text-center cursor-pointer" onClick={() => window.location.href='/finance/invoices'}>
                <FileTextOutlined className="text-2xl mb-2" />
                <div>Create Invoice</div>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
