"use client";

import React, { useState } from "react";
import { Table, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, message, Row, Col } from "antd";
import { PlusOutlined, TeamOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetVendorsQuery, useCreateVendorMutation } from "@/store/api/procurementApi";
import { formatCurrency } from "@/lib/utils";

export default function VendorsPage() {
  const { data: vendors, isLoading } = useGetVendorsQuery();
  const [createVendor] = useCreateVendorMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createVendor(values).unwrap();
      message.success("Vendor created successfully");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to create vendor");
    }
  };

  const columns = [
    {
      title: "Vendor",
      key: "vendor",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{record.name}</span>
          <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{record.code}</span>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span><MailOutlined style={{ fontSize: 12, marginRight: 4 }} />{record.email || "N/A"}</span>
          <span><PhoneOutlined style={{ fontSize: 12, marginRight: 4 }} />{record.phone || "N/A"}</span>
        </Space>
      ),
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Credit Limit",
      dataIndex: "creditLimit",
      key: "creditLimit",
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "KYC Status",
      dataIndex: "kycStatus",
      key: "kycStatus",
      render: (status: string) => (
        <Tag color={status === "VERIFIED" ? "green" : "orange"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" size="small">View Profile</Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Vendors"
        subtitle="Manage supplier relationships and KYC"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement", href: "/procurement" },
          { label: "Vendors" },
        ]}
        extra={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add Vendor
          </Button>,
        ]}
      />

      <Table
        dataSource={vendors}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Add New Vendor"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Vendor Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Acme Corp" />
          </Form.Item>
          <Form.Item name="code" label="Vendor Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. VEND001" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input prefix={<MailOutlined />} placeholder="vendor@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input prefix={<PhoneOutlined />} placeholder="+1 234 567 890" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="currency" label="Currency" initialValue="USD">
                <Select options={[{ label: "USD", value: "USD" }, { label: "EUR", value: "EUR" }, { label: "GBP", value: "GBP" }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="creditLimit" label="Credit Limit" initialValue={0}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
