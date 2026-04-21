"use client";

import React from "react";
import { Form, Input, Button, Typography, Divider, Alert, Space } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  WindowsOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/api/authApi";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values).unwrap();
      router.push("/dashboard");
    } catch {
      // Error state handled by RTK Query
    }
  };

  const apiError = error as { data?: { message?: string } } | undefined;

  return (
    <div className="animate-fade-in-up">
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Title
          level={2}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            marginBottom: 8,
            letterSpacing: "-0.01em",
          }}
        >
          nurox
        </Title>
        <Text
          style={{ color: "var(--color-on-surface-variant)", fontSize: 14 }}
        >
          Enterprise Resource Planning
        </Text>
      </div>

      {/* Card */}
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
          Sign in
        </Title>
        <Text
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: 13,
            display: "block",
            marginBottom: 24,
          }}
        >
          Enter your credentials to access your workspace
        </Text>

        {apiError?.data?.message && (
          <Alert
            type="error"
            message={apiError.data.message}
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          name="login"
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
              { type: "email", message: "Invalid email address" },
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

          <Form.Item
            name="password"
            label={
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                }}
              >
                Password
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
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 16,
              marginTop: -8,
            }}
          >
            <Link
              href="/forgot-password"
              style={{ color: "var(--color-primary)", fontSize: 12 }}
            >
              Forgot password?
            </Link>
          </div>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider
          style={{
            borderColor: "var(--ghost-border)",
            margin: "16px 0",
          }}
        >
          <Text
            style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
          >
            OR CONTINUE WITH
          </Text>
        </Divider>

        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Button
            block
            icon={<GoogleOutlined />}
            style={{ height: 44 }}
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/google`;
            }}
          >
            Google
          </Button>
          <Button
            block
            icon={<WindowsOutlined />}
            style={{ height: 44 }}
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/microsoft`;
            }}
          >
            Microsoft
          </Button>
        </Space>

        <Divider
          style={{
            borderColor: "var(--ghost-border)",
            margin: "16px 0",
          }}
        />

        <div style={{ textAlign: "center" }}>
          <Text
            style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "var(--color-primary)", fontWeight: 500 }}
            >
              Create one
            </Link>
          </Text>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Text
          style={{ color: "var(--color-on-surface-variant)", fontSize: 11 }}
        >
          © {new Date().getFullYear()} Nurox ERP — All rights reserved
        </Text>
      </div>
    </div>
  );
}
