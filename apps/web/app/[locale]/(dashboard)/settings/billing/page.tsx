"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Spin,
  Tag,
  Alert,
  Modal,
  Radio,
  Row,
  Col,
  Divider,
  List,
  Table,
} from "antd";
import {
  useGetCurrentSubscriptionQuery,
  useGetInvoicesQuery,
  useGetPlansQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
} from "@/store/api/billingApi";
import { CreditCard, Download, CheckCircle, AlertCircle } from "lucide-react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function BillingSettingsPage() {
  const { data: subscription, isLoading: subLoading } =
    useGetCurrentSubscriptionQuery();
  const { data: invoicesData, isLoading: invLoading } = useGetInvoicesQuery();
  const { data: plans } = useGetPlansQuery();

  const [createCheckout] = useCreateCheckoutSessionMutation();
  const [createPortal] = useCreatePortalSessionMutation();

  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual",
  );

  const handleManageBilling = async () => {
    try {
      const res = await createPortal({
        returnUrl: window.location.href,
      }).unwrap();
      if (res.url) window.location.href = res.url;
    } catch (error) {
      console.error("Failed to open billing portal", error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const res = await createCheckout({
        planId,
        isAnnual: billingCycle === "annual",
        paymentProvider: "stripe",
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
      }).unwrap();
      if (res.url) window.location.href = res.url;
    } catch (error) {
      console.error("Failed to initiate checkout", error);
    }
  };

  if (subLoading || invLoading)
    return <Spin size="large" className="flex justify-center mt-20" />;

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  const invoiceColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (val: string) => dayjs(val).format("MMM DD, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amountDue",
      key: "amountDue",
      render: (val: number, rec: any) => `${rec.currency} ${val}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: string) => (
        <Tag color={val === "paid" ? "success" : "warning"}>
          {val.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Invoice",
      key: "action",
      render: (_: any, rec: any) =>
        rec.pdfUrl ? (
          <Button
            type="link"
            icon={<Download size={16} />}
            href={rec.pdfUrl}
            target="_blank"
          >
            PDF
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <Title level={2} style={{ margin: 0 }}>
          Billing & Subscription
        </Title>
        {subscription?.stripeCustomerId && (
          <Button
            type="default"
            icon={<CreditCard size={16} />}
            onClick={handleManageBilling}
          >
            Manage Payment Methods
          </Button>
        )}
      </div>

      {!isActive && (
        <Alert
          message="Subscription Inactive"
          description="Your subscription is currently inactive or past due. Please update your payment details."
          type="error"
          showIcon
          icon={<AlertCircle />}
        />
      )}

      <Card title="Current Plan" className="border-colorSplit shadow-sm">
        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Title level={4}>{subscription?.plan?.name || "Free Trial"}</Title>
            <Space className="mb-4">
              <Tag
                color={isActive ? "success" : "error"}
                className="text-sm px-2 py-1"
              >
                {subscription?.status?.toUpperCase()}
              </Tag>
              {subscription?.status === "trialing" && (
                <Text type="secondary">
                  Trial ends on{" "}
                  {dayjs(subscription.trialEndsAt).format("MMM DD, YYYY")}
                </Text>
              )}
            </Space>
            <div className="mt-4">
              <Text type="secondary">Next billing date: </Text>
              <Text strong>
                {subscription?.currentPeriodEnd
                  ? dayjs(subscription.currentPeriodEnd).format("MMM DD, YYYY")
                  : "N/A"}
              </Text>
            </div>
          </Col>
          <Col span={8} className="flex items-center justify-end">
            <Button
              type="primary"
              size="large"
              onClick={() => setIsUpgradeModalVisible(true)}
              className="nurox-btn-primary"
            >
              Upgrade Plan
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="Billing History" className="border-colorSplit shadow-sm">
        <Table
          dataSource={invoicesData?.data || []}
          columns={invoiceColumns}
          rowKey="id"
          pagination={false}
          className="nurox-table-tbody"
        />
      </Card>

      <Modal
        title="Upgrade Subscription"
        open={isUpgradeModalVisible}
        onCancel={() => setIsUpgradeModalVisible(false)}
        footer={null}
        width={900}
        centered
        className="nurox-modal-content"
      >
        <div className="text-center mb-8">
          <Radio.Group
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            buttonStyle="solid"
            size="large"
          >
            <Radio.Button value="monthly">Monthly</Radio.Button>
            <Radio.Button value="annual">Annually (Save 20%)</Radio.Button>
          </Radio.Group>
        </div>

        <Row gutter={[16, 16]}>
          {plans?.map((plan) => (
            <Col span={8} key={plan.id}>
              <Card
                hoverable
                className={`h-full border-colorSplit ${subscription?.planId === plan.id ? "border-primary" : ""}`}
                actions={[
                  <Button
                    type={
                      subscription?.planId === plan.id ? "default" : "primary"
                    }
                    disabled={subscription?.planId === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                    block
                  >
                    {subscription?.planId === plan.id
                      ? "Current Plan"
                      : "Select Plan"}
                  </Button>,
                ]}
              >
                <Title level={4}>{plan.name}</Title>
                <div className="my-4">
                  <Text className="text-3xl font-display font-bold">
                    $
                    {billingCycle === "annual"
                      ? plan.annualPrice
                      : plan.monthlyPrice}
                  </Text>
                  <Text type="secondary"> / mo</Text>
                </div>
                <Divider />
                <List
                  dataSource={plan.features.modules || []}
                  renderItem={(item) => (
                    <List.Item className="border-0 p-1 flex items-start">
                      <CheckCircle
                        size={16}
                        className="text-success mt-1 mr-2"
                      />
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    </div>
  );
}
