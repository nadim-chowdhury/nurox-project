"use client";
import React from "react";
import { Form, Input, Button, Typography, Divider, Alert } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/store/api/authApi";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading, error }] = useRegisterMutation();

  const onFinish = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      await register(values).unwrap();
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
          Create your account
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
          Get started
        </Title>
        <Text
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: 13,
            display: "block",
            marginBottom: 24,
          }}
        >
          Fill in your details to create a new workspace account
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
          name="register"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              name="firstName"
              label={
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                >
                  First name
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1 }}
            >
              <Input
                prefix={
                  <UserOutlined
                    style={{ color: "var(--color-on-surface-variant)" }}
                  />
                }
                placeholder="John"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                >
                  Last name
                </span>
              }
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Doe" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label={
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                }}
              >
                Work email
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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
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
              { required: true, message: "Please confirm your password" },
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
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{ height: 44, fontWeight: 600 }}
            >
              Create Account
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
            OR
          </Text>
        </Divider>

        <div style={{ textAlign: "center" }}>
          <Text
            style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "var(--color-primary)", fontWeight: 500 }}
            >
              Sign in
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
