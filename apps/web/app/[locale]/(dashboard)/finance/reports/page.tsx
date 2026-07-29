"use client";

import { useState } from "react";
import {
  Tabs,
  Table,
  DatePicker,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Tag,
} from "antd";
import {
  FilePdfOutlined,
  FileExcelOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useGetTrialBalanceQuery,
  useGetIncomeStatementQuery,
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
  useGetBudgetVsActualQuery,
  useGetGeneralLedgerQuery,
  useGetARAgingReportQuery,
  useGetAPAgingReportQuery,
  useGetVATReturnQuery,
  useGetTDSReportQuery,
} from "@/store/api/financeApi";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function Reports() {
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("year"),
    dayjs(),
  ]);
  const [asOfDate, setAsOfDate] = useState<dayjs.Dayjs>(dayjs());
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [glPage, setGlPage] = useState(1);

  // Report Queries
  const { data: trialBalance, isLoading: tbLoading } =
    useGetTrialBalanceQuery();
  const { data: incomeStatement } = useGetIncomeStatementQuery({
    startDate: dates[0].toISOString(),
    endDate: dates[1].toISOString(),
  });
  const { data: balanceSheet } = useGetBalanceSheetQuery({
    asOfDate: asOfDate.toISOString(),
  });
  const { data: cashFlow } = useGetCashFlowQuery({
    startDate: dates[0].toISOString(),
    endDate: dates[1].toISOString(),
  });
  const { data: budgetVsActual, isLoading: bvaLoading } =
    useGetBudgetVsActualQuery({
      period: dates[0].format("YYYY-MM"),
    });
  const { data: arAging, isLoading: arLoading } = useGetARAgingReportQuery();
  const { data: apAging, isLoading: apLoading } = useGetAPAgingReportQuery();
  const { data: vatReturn, isLoading: vatLoading } = useGetVATReturnQuery({
    startDate: dates[0].toISOString(),
    endDate: dates[1].toISOString(),
  });
  const { data: tdsReport, isLoading: tdsLoading } = useGetTDSReportQuery({
    startDate: dates[0].toISOString(),
    endDate: dates[1].toISOString(),
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
              {
                title: "Debit",
                dataIndex: "debit",
                render: (val: number) => (val > 0 ? `$${val.toFixed(2)}` : "-"),
              },
              {
                title: "Credit",
                dataIndex: "credit",
                render: (val: number) => (val > 0 ? `$${val.toFixed(2)}` : "-"),
              },
              {
                title: "Actions",
                render: (_: any, record: any) => (
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => setSelectedAccountId(record.accountId)}
                  >
                    Drill-down
                  </Button>
                ),
              },
            ]}
            summary={(pageData: readonly any[]) => {
              const totalDebit = pageData.reduce(
                (sum, item) => sum + (Number(item.debit) || 0),
                0,
              );
              const totalCredit = pageData.reduce(
                (sum, item) => sum + (Number(item.credit) || 0),
                0,
              );
              return (
                <Table.Summary.Row className="font-bold bg-gray-50">
                  <Table.Summary.Cell index={0} colSpan={2}>
                    Total
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    ${totalDebit.toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    ${totalCredit.toFixed(2)}
                  </Table.Summary.Cell>
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
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={incomeStatement?.totalRevenue}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Expense"
                  value={incomeStatement?.totalExpense}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Net Income"
                  value={incomeStatement?.netIncome}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
          </Row>

          <h3 className="text-lg font-semibold border-b pb-2">Revenues</h3>
          <Table
            dataSource={incomeStatement?.revenues}
            pagination={false}
            rowKey="id"
            columns={[
              { title: "Account", dataIndex: "name" },
              {
                title: "Amount",
                dataIndex: "amount",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
            ]}
          />

          <h3 className="text-lg font-semibold border-b pb-2">Expenses</h3>
          <Table
            dataSource={incomeStatement?.expenses}
            pagination={false}
            rowKey="id"
            columns={[
              { title: "Account", dataIndex: "name" },
              {
                title: "Amount",
                dataIndex: "amount",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
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
            <DatePicker
              value={
                asOfDate && dayjs.isDayjs(asOfDate) && asOfDate.isValid()
                  ? asOfDate
                  : dayjs()
              }
              onChange={(val: any) => val && setAsOfDate(val)}
            />
            <Button icon={<FilePdfOutlined />}>PDF</Button>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Assets" size="small">
                <Table
                  dataSource={balanceSheet?.assets}
                  pagination={false}
                  rowKey="id"
                  columns={[
                    { title: "Account", dataIndex: "name" },
                    {
                      title: "Balance",
                      dataIndex: "balance",
                      render: (val: number) => `$${val.toFixed(2)}`,
                    },
                  ]}
                />
                <div className="text-right font-bold p-2">
                  Total Assets: $
                  {balanceSheet?.totalAssets?.toFixed(2) || "0.00"}
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Liabilities & Equity" size="small">
                <Table
                  dataSource={[
                    ...(balanceSheet?.liabilities || []),
                    ...(balanceSheet?.equity || []),
                  ]}
                  pagination={false}
                  rowKey="id"
                  columns={[
                    { title: "Account", dataIndex: "name" },
                    {
                      title: "Balance",
                      dataIndex: "balance",
                      render: (val: number) => `$${val.toFixed(2)}`,
                    },
                  ]}
                />
                <div className="text-right font-bold p-2">
                  Total L&E: $
                  {(
                    (balanceSheet?.totalLiabilities || 0) +
                    (balanceSheet?.totalEquity || 0)
                  ).toFixed(2)}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "cash-flow",
      label: "Cash Flow",
      children: (
        <div className="space-y-6">
          <Card>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Total Inflow"
                  value={cashFlow?.totalInflow}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Outflow"
                  value={cashFlow?.totalOutflow}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Net Cash Flow"
                  value={cashFlow?.netCashFlow}
                  precision={2}
                  prefix="$"
                />
              </Col>
            </Row>
          </Card>
          <p className="text-gray-500 italic">
            Detailed activities categorization coming soon.
          </p>
        </div>
      ),
    },
    {
      key: "budget-vs-actual",
      label: "Budget vs Actual",
      children: (
        <div className="space-y-4">
          <Table
            dataSource={budgetVsActual}
            loading={bvaLoading}
            rowKey="accountId"
            columns={[
              { title: "Account", dataIndex: "accountName" },
              {
                title: "Budgeted",
                dataIndex: "budgeted",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "Actual",
                dataIndex: "actual",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "Variance",
                dataIndex: "variance",
                render: (val: number) => (
                  <span className={val > 0 ? "text-red-500" : "text-green-500"}>
                    ${val.toFixed(2)}
                  </span>
                ),
              },
              {
                title: "Variance %",
                dataIndex: "variancePercent",
                render: (val: number) => `${val.toFixed(1)}%`,
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: "ar-aging",
      label: "AR Aging",
      children: (
        <div className="space-y-4">
          <Table
            dataSource={arAging}
            loading={arLoading}
            rowKey="customerName"
            columns={[
              { title: "Customer", dataIndex: "customerName" },
              {
                title: "Total",
                dataIndex: "total",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "Current",
                dataIndex: "current",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "1-30 Days",
                dataIndex: "days1_30",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "31-60 Days",
                dataIndex: "days31_60",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "61-90 Days",
                dataIndex: "days61_90",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "90+ Days",
                dataIndex: "days90Plus",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: "ap-aging",
      label: "AP Aging",
      children: (
        <div className="space-y-4">
          <Table
            dataSource={apAging}
            loading={apLoading}
            rowKey="vendorName"
            columns={[
              { title: "Vendor", dataIndex: "vendorName" },
              {
                title: "Total",
                dataIndex: "total",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "Current",
                dataIndex: "current",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "1-30 Days",
                dataIndex: "days1_30",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "31-60 Days",
                dataIndex: "days31_60",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "61-90 Days",
                dataIndex: "days61_90",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "90+ Days",
                dataIndex: "days90Plus",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: "vat-return",
      label: "VAT Return",
      children: (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Output VAT (Sales)"
                  value={vatReturn?.outputTax || 0}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Input VAT (Purchases)"
                  value={vatReturn?.inputTax || 0}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Net VAT Payable"
                  value={
                    (vatReturn?.outputTax || 0) - (vatReturn?.inputTax || 0)
                  }
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
          </Row>
          <Table
            dataSource={vatReturn?.details}
            loading={vatLoading}
            rowKey="id"
            columns={[
              { title: "Tax Rate", dataIndex: "taxRateName" },
              {
                title: "Net Amount",
                dataIndex: "netAmount",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "Tax Amount",
                dataIndex: "taxAmount",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              { title: "Type", dataIndex: "type" },
            ]}
          />
        </div>
      ),
    },
    {
      key: "tds-report",
      label: "TDS Report",
      children: (
        <div className="space-y-4">
          <Table
            dataSource={tdsReport}
            loading={tdsLoading}
            rowKey="id"
            columns={[
              { title: "Vendor/Employee", dataIndex: "partyName" },
              {
                title: "Gross Amount",
                dataIndex: "grossAmount",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              {
                title: "TDS Amount",
                dataIndex: "tdsAmount",
                render: (val: number) => `$${val.toFixed(2)}`,
              },
              { title: "Section", dataIndex: "section" },
              {
                title: "Status",
                dataIndex: "status",
                render: (s: string) => (
                  <Tag color={s === "PAID" ? "green" : "orange"}>{s}</Tag>
                ),
              },
            ]}
          />
          <div className="flex justify-end">
            <Button type="primary">Download Challan</Button>
          </div>
        </div>
      ),
    },
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
        <GLTable
          accountId={selectedAccountId!}
          page={glPage}
          setPage={setGlPage}
        />
      </Modal>
    </div>
  );
}

function GLTable({
  accountId,
  page,
  setPage,
}: {
  accountId: string;
  page: number;
  setPage: (p: number) => void;
}) {
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
        onChange: (p: number) => setPage(p),
      }}
      columns={[
        {
          title: "Date",
          dataIndex: ["journalEntry", "entryDate"],
          render: (val: string) => dayjs(val).format("YYYY-MM-DD"),
        },
        { title: "Ref", dataIndex: ["journalEntry", "entryNumber"] },
        { title: "Description", dataIndex: "description" },
        {
          title: "Debit",
          dataIndex: "debit",
          render: (val: number) => (val > 0 ? `$${val.toFixed(2)}` : "-"),
        },
        {
          title: "Credit",
          dataIndex: "credit",
          render: (val: number) => (val > 0 ? `$${val.toFixed(2)}` : "-"),
        },
      ]}
    />
  );
}
