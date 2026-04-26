"use client";

import { useState } from "react";
import { Tabs, Table, DatePicker, Button, Space, Card, Row, Col, Statistic, Modal } from "antd";
import { 
  FilePdfOutlined, 
  FileExcelOutlined,
  EyeOutlined 
} from "@ant-design/icons";
import { 
  useGetTrialBalanceQuery, 
  useGetIncomeStatementQuery, 
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
  useGetBudgetVsActualQuery,
  useGetGeneralLedgerQuery
} from "@/store/api/financeApi";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function Reports() {
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf('year'), dayjs()]);
  const [asOfDate, setAsOfDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [glPage, setGlPage] = useState(1);

  // Report Queries
  const { data: trialBalance, isLoading: tbLoading } = useGetTrialBalanceQuery();
  const { data: incomeStatement, isLoading: _isLoading } = useGetIncomeStatementQuery({ 
    startDate: dates[0].toISOString(), 
    endDate: dates[1].toISOString() 
  });
  const { data: balanceSheet, isLoading: _bsLoading } = useGetBalanceSheetQuery({ 
    asOfDate: asOfDate.toISOString() 
  });
  const { data: cashFlow, isLoading: _cfLoading } = useGetCashFlowQuery({
    startDate: dates[0].toISOString(),
    endDate: dates[1].toISOString()
  });
  const { data: budgetVsActual, isLoading: bvaLoading } = useGetBudgetVsActualQuery({
    period: dates[0].format("YYYY-MM")
  });

  const reportTabs = [
    {
      key: "trial-balance",
      label: "Trial Balance",
      children: (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Space>
              <Button icon={<FilePdfOutlined />}>PDF</Button>
              <Button icon={<FileExcelOutlined />}>Excel</Button>
            </Space>
          </div>
          <Table
            dataSource={trialBalance}
            loading={tbLoading}
            rowKey="accountId"
            columns={[
              { title: "Code", dataIndex: "code" },
              { title: "Account", dataIndex: "name" },
              { title: "Debit", dataIndex: "debit", render: (val) => val > 0 ? `$${val.toFixed(2)}` : "-" },
              { title: "Credit", dataIndex: "credit", render: (val) => val > 0 ? `$${val.toFixed(2)}` : "-" },
              { 
                title: "Actions", 
                render: (_, record) => (
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setSelectedAccountId(record.accountId)}
                  >
                    Drill-down
                  </Button>
                ) 
              }
            ]}
            summary={(data) => {
              const totalDebit = data.reduce((sum, item) => sum + item.debit, 0);
              const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);
              return (
                <Table.Summary.Row className="font-bold bg-gray-50">
                  <Table.Summary.Cell index={0} colSpan={2}>Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>${totalDebit.toFixed(2)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>${totalCredit.toFixed(2)}</Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      ),
    },
    {
      key: "income-statement",
      label: "Income Statement",
      children: (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
            <RangePicker value={dates} onChange={(val: any) => setDates(val)} />
            <Space>
              <Button icon={<FilePdfOutlined />}>PDF</Button>
            </Space>
          </div>
          
          <Row gutter={16}>
            <Col span={8}>
              <Card><Statistic title="Total Revenue" value={incomeStatement?.totalRevenue} precision={2} prefix="$" /></Card>
            </Col>
            <Col span={8}>
              <Card><Statistic title="Total Expense" value={incomeStatement?.totalExpense} precision={2} prefix="$" /></Card>
            </Col>
            <Col span={8}>
              <Card><Statistic title="Net Income" value={incomeStatement?.netIncome} precision={2} prefix="$" valueStyle={{ color: '#3f8600' }} /></Card>
            </Col>
          </Row>

          <h3 className="text-lg font-semibold border-b pb-2">Revenues</h3>
          <Table
            dataSource={incomeStatement?.revenues}
            pagination={false}
            columns={[
              { title: "Account", dataIndex: "name" },
              { title: "Amount", dataIndex: "amount", render: (val) => `$${val.toFixed(2)}` },
            ]}
          />

          <h3 className="text-lg font-semibold border-b pb-2">Expenses</h3>
          <Table
            dataSource={incomeStatement?.expenses}
            pagination={false}
            columns={[
              { title: "Account", dataIndex: "name" },
              { title: "Amount", dataIndex: "amount", render: (val) => `$${val.toFixed(2)}` },
            ]}
          />
        </div>
      ),
    },
    {
        key: "balance-sheet",
        label: "Balance Sheet",
        children: (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
              <DatePicker value={asOfDate} onChange={(val: any) => setAsOfDate(val)} />
              <Button icon={<FilePdfOutlined />}>PDF</Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Assets" size="small">
                        <Table
                            dataSource={balanceSheet?.assets}
                            pagination={false}
                            columns={[{ title: "Account", dataIndex: "name" }, { title: "Balance", dataIndex: "balance", render: (val) => `$${val.toFixed(2)}` }]}
                        />
                        <div className="text-right font-bold p-2">Total Assets: ${balanceSheet?.totalAssets.toFixed(2)}</div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Liabilities & Equity" size="small">
                        <Table
                            dataSource={[...(balanceSheet?.liabilities || []), ...(balanceSheet?.equity || [])]}
                            pagination={false}
                            columns={[{ title: "Account", dataIndex: "name" }, { title: "Balance", dataIndex: "balance", render: (val) => `$${val.toFixed(2)}` }]}
                        />
                        <div className="text-right font-bold p-2">Total L&E: ${(balanceSheet?.totalLiabilities + balanceSheet?.totalEquity).toFixed(2)}</div>
                    </Card>
                </Col>
            </Row>
          </div>
        )
    },
    {
        key: "cash-flow",
        label: "Cash Flow",
        children: (
            <div className="space-y-6">
                <Card>
                    <Row gutter={16}>
                        <Col span={8}><Statistic title="Total Inflow" value={cashFlow?.totalInflow} precision={2} prefix="$" /></Col>
                        <Col span={8}><Statistic title="Total Outflow" value={cashFlow?.totalOutflow} precision={2} prefix="$" /></Col>
                        <Col span={8}><Statistic title="Net Cash Flow" value={cashFlow?.netCashFlow} precision={2} prefix="$" /></Col>
                    </Row>
                </Card>
                <p className="text-gray-500 italic">Detailed activities categorization coming soon.</p>
            </div>
        )
    },
    {
        key: "budget-vs-actual",
        label: "Budget vs Actual",
        children: (
            <div className="space-y-4">
                <Table
                    dataSource={budgetVsActual}
                    loading={bvaLoading}
                    columns={[
                        { title: "Account", dataIndex: "accountName" },
                        { title: "Budgeted", dataIndex: "budgeted", render: (val) => `$${val.toFixed(2)}` },
                        { title: "Actual", dataIndex: "actual", render: (val) => `$${val.toFixed(2)}` },
                        { 
                            title: "Variance", 
                            dataIndex: "variance", 
                            render: (val) => (
                                <span className={val > 0 ? "text-red-500" : "text-green-500"}>
                                    ${val.toFixed(2)}
                                </span>
                            )
                        },
                        { 
                            title: "Variance %", 
                            dataIndex: "variancePercent", 
                            render: (val) => `${val.toFixed(1)}%` 
                        },
                    ]}
                />
            </div>
        )
    }
  ];

  return (
    <div>
      <Tabs items={reportTabs} />

      <Modal
        title="General Ledger Drill-down"
        open={!!selectedAccountId}
        onCancel={() => setSelectedAccountId(null)}
        width={1000}
        footer={null}
      >
        <GLTable accountId={selectedAccountId!} page={glPage} setPage={setGlPage} />
      </Modal>
    </div>
  );
}

function GLTable({ accountId, page, setPage }: { accountId: string, page: number, setPage: (p: number) => void }) {
  const { data, isLoading } = useGetGeneralLedgerQuery({ accountId, page });

  return (
    <Table
      dataSource={data?.data}
      loading={isLoading}
      rowKey="id"
      pagination={{
        total: data?.meta?.total,
        current: page,
        pageSize: 20,
        onChange: (p) => setPage(p)
      }}
      columns={[
        { title: "Date", dataIndex: ["journalEntry", "entryDate"], render: (val) => dayjs(val).format("YYYY-MM-DD") },
        { title: "Ref", dataIndex: ["journalEntry", "entryNumber"] },
        { title: "Description", dataIndex: "description" },
        { title: "Debit", dataIndex: "debit", render: (val) => val > 0 ? `$${val.toFixed(2)}` : "-" },
        { title: "Credit", dataIndex: "credit", render: (val) => val > 0 ? `$${val.toFixed(2)}` : "-" },
      ]}
    />
  );
}
