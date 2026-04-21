"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async () => {
    // TODO: Wire to API endpoint with token from URL params
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
                Password reset!
              </span>
            }
            subTitle={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Your password has been successfully updated. Sign in with your
                new password.
              </span>
            }
            extra={
              <Link href="/login">
                <Button type="primary" style={{ fontWeight: 600 }}>
                  Sign In
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
          Reset password
        </Title>
        <Text
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: 13,
            display: "block",
            marginBottom: 24,
          }}
        >
          Choose a new password for your account.
        </Text>

        <Form
          name="reset-password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="password"
            label={
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                }}
              >
                New password
              </span>
            }
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "Minimum 8 characters" },
            ]}
          >
            <Input.Password
              prefix={
                <LockOutlined
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
              }
              placeholder="Min. 8 characters"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                }}
              >
                Confirm password
              </span>
            }
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={
                <LockOutlined
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
              }
              placeholder="Repeat password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
