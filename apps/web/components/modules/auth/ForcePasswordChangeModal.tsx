"use client";

import React from "react";
import { Modal, Form, Input, Button, message, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useChangePasswordMutation } from "@/store/api/authApi";

interface ForcePasswordChangeModalProps {
  visible: boolean;
  user: any;
  onSuccess: () => void;
}

export function ForcePasswordChangeModal({ visible, user, onSuccess }: ForcePasswordChangeModalProps) {
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleFinish = async (values: any) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      message.success("Password updated successfully");
      onSuccess();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to update password");
    }
  };

  return (
    <Modal
      title="Update Password"
      open={visible}
      footer={null}
      closable={false}
      maskClosable={false}
      destroyOnClose
    >
      <Alert
        message="Password change required"
        description="For security reasons, you must change your password on your first login or after an administrative reset."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Required" },
            { min: 8, message: "Min 8 characters" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Required" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            style={{ height: 44 }}
          >
            Set New Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
