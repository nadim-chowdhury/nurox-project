"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Result } from "antd";
import { MailOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async () => {
    // TODO: Wire to API endpoint
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in-up">
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--ghost-border)",
            borderRadius: 4,
            padding: 40,
            boxShadow: "var(--shadow-float)",
            textAlign: "center",
          }}
        >
          <Result
            status="success"
            title={
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-on-surface)",
                }}
              >
                Check your email
              </span>
            }
            subTitle={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                If an account with that email exists, we&apos;ve sent password
                reset instructions.
              </span>
            }
            extra={
              <Link href="/login">
                <Button type="primary" style={{ fontWeight: 600 }}>
                  Back to Sign In
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Title
          level={2}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            marginBottom: 8,
          }}
        >
          nurox
        </Title>
      </div>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          padding: 32,
          boxShadow: "var(--shadow-float)",
        }}
      >
        <Title
          level={4}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            marginBottom: 4,
          }}
        >
          Forgot password?
        </Title>
        <Text
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: 13,
            display: "block",
            marginBottom: 24,
          }}
        >
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </Text>

        <Form
          name="forgot-password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            label={
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                }}
              >
                Email
              </span>
            }
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input
              prefix={
                <MailOutlined
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
              }
              placeholder="you@company.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/login"
            style={{ color: "var(--color-primary)", fontSize: 13 }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
