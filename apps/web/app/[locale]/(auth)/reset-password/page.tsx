"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Result, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { PasswordStrengthMeter } from "@/components/modules/auth/PasswordStrengthMeter";

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const password = Form.useWatch("password", form);
  const [submitted, setSubmitted] = useState(false);
  
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const onFinish = async (values: any) => {
    if (!email || !token) return;
    try {
      await resetPassword({
        email,
        token,
        newPassword: values.password,
      }).unwrap();
      setSubmitted(true);
    } catch {
      // Error handled by RTK Query
    }
  };

  const apiError = error as { data?: { message?: string } } | undefined;

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

        {(!email || !token) && (
          <Alert
            type="warning"
            message="Invalid link"
            description="The password reset link is missing required parameters. Please check your email again."
            style={{ marginBottom: 20 }}
          />
        )}

        {apiError?.data?.message && (
          <Alert
            type="error"
            message={apiError.data.message}
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          form={form}
          name="reset-password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
          disabled={!email || !token}
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

          <PasswordStrengthMeter password={password} />

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
              loading={isLoading}
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
