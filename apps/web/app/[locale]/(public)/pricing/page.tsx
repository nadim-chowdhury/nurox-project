"use client";

import React, { useState } from "react";
import { Card, Button, Typography, Radio, Row, Col, Divider, List } from "antd";
import {
  useGetPlansQuery,
  useCreateCheckoutSessionMutation,
} from "@/store/api/billingApi";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function PricingPage() {
  const router = useRouter();
  const { data: plans, isLoading } = useGetPlansQuery();
  const [createCheckout] = useCreateCheckoutSessionMutation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "annual",
  );

  const handleSelectPlan = async (planId: string) => {
    // If not authenticated, redirect to signup
    // In a real app, you might check auth state here
    try {
      const res = await createCheckout({
        planId,
        isAnnual: billingCycle === "annual",
        paymentProvider: "stripe",
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/pricing`,
      }).unwrap();
      if (res.url) window.location.href = res.url;
    } catch (error) {
      console.error("Checkout failed", error);
      // Redirect to login/signup if unauthorized
      router.push("/login");
    }
  };

  if (isLoading)
    return <div className="text-center p-20">Loading plans...</div>;

  return (
    <div className="min-h-screen bg-bgBase flex flex-col items-center py-20 px-4">
      <div className="text-center mb-12 max-w-2xl">
        <Title level={1} className="font-display">
          Simple, transparent pricing
        </Title>
        <Text type="secondary" className="text-lg">
          Choose the plan that fits your business needs. Upgrade, downgrade, or
          cancel at any time.
        </Text>
      </div>

      <div className="text-center mb-12">
        <Radio.Group
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value)}
          buttonStyle="solid"
          size="large"
          className="bg-surfaceContainer rounded p-1"
        >
          <Radio.Button value="monthly" className="bg-transparent border-0">
            Monthly
          </Radio.Button>
          <Radio.Button value="annual" className="bg-transparent border-0">
            Annually (Save 20%)
          </Radio.Button>
        </Radio.Group>
      </div>

      <div className="max-w-6xl w-full">
        <Row gutter={[24, 24]} justify="center">
          {plans?.map((plan) => (
            <Col xs={24} md={12} lg={8} key={plan.id}>
              <Card
                hoverable
                className="h-full border-colorSplit bg-surfaceContainer relative overflow-hidden flex flex-col"
                bodyStyle={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="mb-6">
                  <Title level={3} className="m-0 text-primary">
                    {plan.name}
                  </Title>
                  <Text type="secondary">
                    {plan.description || "Perfect for growing businesses."}
                  </Text>
                </div>

                <div className="mb-6">
                  <Text className="text-5xl font-display font-bold text-text">
                    $
                    {billingCycle === "annual"
                      ? plan.annualPrice
                      : plan.monthlyPrice}
                  </Text>
                  <Text type="secondary" className="text-lg">
                    {" "}
                    / mo
                  </Text>
                  {billingCycle === "annual" && (
                    <div className="mt-2 text-success text-sm font-semibold">
                      Billed annually
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  className="nurox-btn-primary mb-8"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Get Started
                </Button>

                <Divider className="border-colorSplit" />

                <div className="flex-1">
                  <Text strong className="mb-4 block text-textSecondary">
                    What's included:
                  </Text>
                  <List
                    dataSource={[
                      `Up to ${plan.features.maxUsers} Users`,
                      `${plan.features.storageLimitGb}GB Storage`,
                      ...plan.features.modules,
                    ]}
                    renderItem={(item) => (
                      <List.Item className="border-0 p-1 flex items-start text-textSecondary">
                        <CheckCircle
                          size={18}
                          className="text-primary mt-0.5 mr-3 flex-shrink-0"
                        />
                        <Text className="text-text">{item}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
