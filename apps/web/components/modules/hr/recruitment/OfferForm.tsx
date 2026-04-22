"use client";

import React from "react";
import { Form, Input, InputNumber, DatePicker, Button, Space, message } from "antd";
import { useCreateOfferMutation, useGenerateOfferPdfMutation } from "@/store/api/recruitmentApi";

export function OfferForm({ applicationId, onSuccess }: { applicationId: string; onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [generatePdf, { isLoading: isGenerating }] = useGenerateOfferPdfMutation();

  const onFinish = async (values: any) => {
    try {
      const offer = await createOffer({
        applicationId,
        joiningDate: values.joiningDate.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
        baseSalary: values.baseSalary,
        currency: values.currency,
      }).unwrap();

      message.success("Offer created, generating PDF...");
      
      await generatePdf(offer.id).unwrap();
      message.success("Offer letter generated successfully");
      
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Failed to create offer letter");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ currency: "USD", baseSalary: 50000 }}
    >
      <Form.Item
        name="baseSalary"
        label="Annual Base Salary"
        rules={[{ required: true, message: "Please enter salary" }]}
      >
        <InputNumber style={{ width: "100%" }} formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
      </Form.Item>

      <Form.Item
        name="currency"
        label="Currency"
        rules={[{ required: true, message: "Please enter currency" }]}
      >
        <Input placeholder="e.g. USD, BDT, EUR" />
      </Form.Item>

      <Form.Item
        name="joiningDate"
        label="Target Joining Date"
        rules={[{ required: true, message: "Please select joining date" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="expiryDate"
        label="Offer Expiry Date"
        rules={[{ required: true, message: "Please select expiry date" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isCreating || isGenerating}>
            Create & Generate PDF
          </Button>
          <Button onClick={() => form.resetFields()}>Reset</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
