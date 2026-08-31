"use client";

import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Alert,
  Statistic,
} from "antd";
import {
  FileProtectOutlined,
  CalculatorOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { DataTable } from "@/components/tables/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useCalculateTaxMutation,
  useCheckFilingReadinessQuery,
  useGenerateMushak63Mutation,
  useGenerateMushak66Mutation,
  useGenerateVatReturnMutation,
} from "@/store/api/complianceApi";

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("mushak-91");
  const [selectedPeriod, setSelectedPeriod] = useState("2026-08");

  // API Queries & Mutations
  const { data: readinessData, isLoading: isLoadingReadiness } =
    useCheckFilingReadinessQuery(selectedPeriod);

  const [calculateTax, { isLoading: isCalculating }] =
    useCalculateTaxMutation();
  const [generateMushak63, { isLoading: isGen63 }] =
    useGenerateMushak63Mutation();
  const [generateMushak66, { isLoading: isGen66 }] =
    useGenerateMushak66Mutation();
  const [generateVatReturn, { isLoading: isGen91 }] =
    useGenerateVatReturnMutation();

  // Modals
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [isMushak63Open, setIsMushak63Open] = useState(false);
  const [calcResult, setCalcResult] = useState<any | null>(null);

  const [calcForm] = Form.useForm();
  const [mushak63Form] = Form.useForm();
  const [vatReturnForm] = Form.useForm();

  const handleCalculate = async () => {
    try {
      const values = await calcForm.validateFields();
      const res = await calculateTax({
        jurisdiction: values.jurisdiction,
        lines: [
          {
            lineId: "line-1",
            amount: values.amount,
            category: values.category,
          },
        ],
      }).unwrap();
      setCalcResult(res);
      message.success("Tax computation complete");
    } catch {
      message.error("Failed to compute tax");
    }
  };

  const handleGenerate63 = async () => {
    try {
      const values = await mushak63Form.validateFields();
      await generateMushak63(values).unwrap();
      message.success("Mushak 6.3 Tax Invoice generated");
      setIsMushak63Open(false);
      mushak63Form.resetFields();
    } catch {
      message.error("Failed to generate Mushak 6.3");
    }
  };

  const handleGenerate91 = async () => {
    try {
      const values = await vatReturnForm.validateFields();
      await generateVatReturn({
        period: values.period || selectedPeriod,
        jurisdiction: "BD",
      }).unwrap();
      message.success("Mushak 9.1 VAT Return generated");
    } catch {
      message.error("Failed to generate Mushak 9.1 return");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Tax & Regulatory Compliance"
        subtitle="National Board of Revenue (NBR) Mushak 6.3, 6.6, 9.1 & Multi-Jurisdiction Tax Engine"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Compliance" },
        ]}
        extra={
          <Space>
            <Button
              icon={<CalculatorOutlined />}
              onClick={() => setIsCalcModalOpen(true)}
            >
              Tax Calculator
            </Button>
            <Button
              type="primary"
              icon={<FileProtectOutlined />}
              onClick={() => setIsMushak63Open(true)}
            >
              Issue Mushak 6.3
            </Button>
          </Space>
        }
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Active Tax Jurisdiction" value="Bangladesh (NBR)" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Standard VAT Rate" value="15.0%" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Filing Readiness"
            value={
              readinessData?.isReady ? "100% Ready" : "Pending Reconciliation"
            }
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Filing Period" value={selectedPeriod} />
        </Col>
      </Row>

      {/* Readiness Alert */}
      {readinessData && (
        <Alert
          style={{ marginBottom: 24, borderRadius: 4 }}
          type={readinessData.isReady ? "success" : "warning"}
          showIcon
          message={
            readinessData.isReady
              ? "All sales invoices, VDS certificates, and purchase registers are reconciled for this period."
              : "Action required prior to filing return."
          }
          description={
            readinessData.issues?.length
              ? readinessData.issues.join(" • ")
              : "Compliant with NBR VAT Act 2012."
          }
        />
      )}

      {/* Tabs */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "mushak-91",
              label: (
                <span>
                  <FileProtectOutlined /> Mushak 9.1 (Monthly VAT Return)
                </span>
              ),
              children: (
                <div style={{ padding: "16px 0" }}>
                  <Form
                    form={vatReturnForm}
                    layout="inline"
                    initialValues={{ period: selectedPeriod }}
                    style={{ marginBottom: 24 }}
                  >
                    <Form.Item name="period" label="Tax Period">
                      <Select
                        style={{ width: 140 }}
                        options={[
                          { label: "August 2026", value: "2026-08" },
                          { label: "July 2026", value: "2026-07" },
                          { label: "June 2026", value: "2026-06" },
                        ]}
                        onChange={(v) => setSelectedPeriod(v)}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      loading={isGen91}
                      onClick={handleGenerate91}
                    >
                      Generate & File Mushak 9.1 Package
                    </Button>
                  </Form>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      padding: 24,
                      borderRadius: 8,
                      border: "1px solid var(--ghost-border)",
                    }}
                  >
                    <h4
                      style={{
                        color: "var(--color-on-surface)",
                        marginBottom: 16,
                      }}
                    >
                      Mushak 9.1 Schedule Summary (Period: {selectedPeriod})
                    </h4>
                    <Row gutter={[24, 24]}>
                      <Col span={8}>
                        <Statistic
                          title="Part 3: Total Standard VAT Sales"
                          value={formatCurrency(450000)}
                          valueStyle={{ color: "var(--color-on-surface)" }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Part 4: Input Tax Credit (Rebate)"
                          value={formatCurrency(32500)}
                          valueStyle={{ color: "var(--color-success)" }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Part 5: Net Payable VAT"
                          value={formatCurrency(35000)}
                          valueStyle={{ color: "var(--color-primary)" }}
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              ),
            },
            {
              key: "mushak-66",
              label: (
                <span>
                  <FileProtectOutlined /> Mushak 6.6 (VDS Certificates)
                </span>
              ),
              children: (
                <div style={{ padding: "16px 0" }}>
                  <p
                    style={{
                      color: "var(--color-on-surface-variant)",
                      marginBottom: 16,
                    }}
                  >
                    Manage VAT Deducted at Source (VDS) certificates issued to
                    suppliers and government treasuries.
                  </p>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={isGen66}
                    onClick={() => {
                      generateMushak66({
                        period: selectedPeriod,
                        jurisdiction: "BD",
                      });
                      message.success(
                        "Mushak 6.6 VDS certificate batch prepared",
                      );
                    }}
                  >
                    Generate VDS Certificates (Mushak 6.6)
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Tax Calculator Modal */}
      <Modal
        title="Multi-Jurisdiction Tax Calculator"
        open={isCalcModalOpen}
        onCancel={() => setIsCalcModalOpen(false)}
        onOk={handleCalculate}
        confirmLoading={isCalculating}
        okText="Calculate Tax"
      >
        <Form form={calcForm} layout="vertical">
          <Form.Item
            name="jurisdiction"
            label="Tax Jurisdiction"
            initialValue="BD"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Bangladesh (NBR VAT & SD Act 2012)", value: "BD" },
                { label: "United States (Sales Tax)", value: "US" },
                { label: "European Union (Standard VAT)", value: "EU" },
                { label: "United Arab Emirates (FTA VAT)", value: "AE" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Taxable Base Amount ($/৳)"
            rules={[{ required: true, message: "Enter amount" }]}
            initialValue={1000}
          >
            <InputNumber min={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Product / Service Category"
            initialValue="STANDARD_GOODS"
          >
            <Select
              options={[
                {
                  label: "Standard Rated Goods (15%)",
                  value: "STANDARD_GOODS",
                },
                { label: "IT & Software Services (5%)", value: "IT_SERVICES" },
                { label: "Zero-Rated Export (0%)", value: "EXPORTS" },
                { label: "Exempt Healthcare / Education", value: "EXEMPT" },
              ]}
            />
          </Form.Item>
        </Form>

        {calcResult && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "rgba(195,245,255,0.06)",
              borderRadius: 4,
              border: "1px solid rgba(195,245,255,0.2)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--color-on-surface)" }}>
              <strong>Calculated Tax Amount:</strong>{" "}
              {formatCurrency(calcResult.totalTax || 0)}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-on-surface-variant)",
                marginTop: 4,
              }}
            >
              Jurisdiction: {calcResult.jurisdiction} • Applied Rules: NBR Rate
              Schedule
            </div>
          </div>
        )}
      </Modal>

      {/* Mushak 6.3 Modal */}
      <Modal
        title="Issue Mushak 6.3 Tax Invoice"
        open={isMushak63Open}
        onCancel={() => setIsMushak63Open(false)}
        onOk={handleGenerate63}
        confirmLoading={isGen63}
        okText="Generate Tax Invoice"
      >
        <Form form={mushak63Form} layout="vertical">
          <Form.Item
            name="invoiceId"
            label="Source Sales Invoice / Order"
            rules={[{ required: true, message: "Enter invoice reference" }]}
          >
            <Input placeholder="e.g. INV-2026-0089" />
          </Form.Item>
          <Form.Item
            name="buyerBin"
            label="Buyer BIN / Tax Identification Number"
          >
            <Input placeholder="13-digit BIN (e.g. 001234567-0101)" />
          </Form.Item>
          <Form.Item
            name="vehicleNumber"
            label="Delivery Vehicle No (Optional)"
          >
            <Input placeholder="e.g. DHAKA METRO-TA-11-2345" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
