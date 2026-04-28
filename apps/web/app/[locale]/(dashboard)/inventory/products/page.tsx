"use client";

import React, { useState } from "react";
import { Table, Tag, Button, Space, Card, Modal, Form, Input, Select, InputNumber, message, Avatar, Row, Col } from "antd";
import { PlusOutlined, InboxOutlined, BarcodeOutlined, ExperimentOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetProductsQuery, useCreateProductMutation } from "@/store/api/inventoryApi";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const { data: products, isLoading } = useGetProductsQuery({});
  const [createProduct] = useCreateProductMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createProduct(values).unwrap();
      message.success("Product added to catalog");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to add product");
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, record: any) => (
        <Space>
          <Avatar 
            shape="square" 
            size={40} 
            src={record.imageUrl} 
            icon={<InboxOutlined />} 
            style={{ backgroundColor: "var(--color-surface-variant)" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600 }}>{record.name}</span>
            <span style={{ fontSize: 12, color: "gray" }}>SKU: {record.sku}</span>
          </div>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => <Tag>{cat || "General"}</Tag>,
    },
    {
      title: "UOM",
      dataIndex: "uom",
      key: "uom",
    },
    {
      title: "Base Price",
      dataIndex: "basePrice",
      key: "price",
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Reorder Point",
      dataIndex: "reorderPoint",
      key: "reorder",
      render: (val: number) => (
        <span style={{ color: val > 0 ? "orange" : "inherit" }}>{val}</span>
      ),
    },
    {
      title: "Valuation",
      dataIndex: "valuationMethod",
      key: "valuation",
      render: (method: string) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, _record: any) => (
        <Space>
          <Button icon={<ExperimentOutlined />} size="small">Variants</Button>
          <Button type="link" size="small">Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Product Catalog"
        subtitle="Manage SKUs, variants, and stock thresholds"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Products" },
        ]}
        extra={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add Product
          </Button>,
        ]}
      />

      <Table
        dataSource={products}
        columns={columns}
        loading={isLoading}
        rowKey="id"
      />

      <Modal
        title="Add New Product"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Industrial Drill" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input placeholder="DRL-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="uom" label="UOM" initialValue="PCS">
                <Select options={[{ label: "Pieces", value: "PCS" }, { label: "KG", value: "KG" }, { label: "Litre", value: "L" }]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="basePrice" label="Base Price" initialValue={0}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="reorderPoint" label="Reorder Point" initialValue={10}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="valuationMethod" label="Valuation Method" initialValue="FIFO">
            <Select options={[
              { label: "First-In First-Out (FIFO)", value: "FIFO" },
              { label: "Last-In First-Out (LIFO)", value: "LIFO" },
              { label: "First-Expired First-Out (FEFO)", value: "FEFO" },
            ]} />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
