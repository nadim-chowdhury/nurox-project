"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  RobotOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetProductsQuery,
  useCreateProductMutation,
} from "@/store/api/inventoryApi";
import { formatCurrency } from "@/lib/utils";
import { DemandForecastWidget } from "@/components/modules/inventory/DemandForecastWidget";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductDto } from "@repo/shared-schemas";
import { RhfInput } from "@/components/common/forms/RhfInput";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfInputNumber } from "@/components/common/forms/RhfInputNumber";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";

export default function ProductsPage() {
  const { data: products, isLoading } = useGetProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isForecastVisible, setIsForecastVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const { control, handleSubmit, reset } = useForm<ProductDto>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      uom: "PCS",
      basePrice: 0,
      reorderPoint: 10,
      valuationMethod: "FIFO",
      description: "",
    },
  });

  const handleCreate = async (values: ProductDto) => {
    try {
      await createProduct(values).unwrap();
      message.success("Product added to catalog");
      setIsModalVisible(false);
      reset();
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
            <span style={{ fontSize: 12, color: "gray" }}>
              SKU: {record.sku}
            </span>
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
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<RobotOutlined />}
            size="small"
            onClick={() => {
              setSelectedProductId(record.id);
              setIsForecastVisible(true);
            }}
          >
            AI Forecast
          </Button>
          <Button icon={<ExperimentOutlined />} size="small">
            Variants
          </Button>
          <Button type="link" size="small">
            Edit
          </Button>
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
        title="AI Demand Forecasting"
        open={isForecastVisible}
        onCancel={() => {
          setIsForecastVisible(false);
          setSelectedProductId(null);
        }}
        footer={null}
        width={800}
      >
        {selectedProductId && (
          <DemandForecastWidget productId={selectedProductId} />
        )}
      </Modal>

      <Modal
        title="Add New Product"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit(handleCreate)}
        width={600}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <RhfInput
                name="name"
                control={control}
                label="Product Name"
                placeholder="e.g. Industrial Drill"
              />
            </Col>
            <Col span={8}>
              <RhfInput
                name="sku"
                control={control}
                label="SKU"
                placeholder="DRL-001"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <RhfSelect
                name="uom"
                control={control}
                label="UOM"
                options={[
                  { label: "Pieces", value: "PCS" },
                  { label: "KG", value: "KG" },
                  { label: "Litre", value: "L" },
                ]}
              />
            </Col>
            <Col span={8}>
              <RhfInputNumber
                name="basePrice"
                control={control}
                label="Base Price"
                style={{ width: "100%" }}
                min={0}
              />
            </Col>
            <Col span={8}>
              <RhfInputNumber
                name="reorderPoint"
                control={control}
                label="Reorder Point"
                style={{ width: "100%" }}
                min={0}
              />
            </Col>
          </Row>

          <RhfSelect
            name="valuationMethod"
            control={control}
            label="Valuation Method"
            options={[
              { label: "First-In First-Out (FIFO)", value: "FIFO" },
              { label: "Last-In First-Out (LIFO)", value: "LIFO" },
              { label: "First-Expired First-Out (FEFO)", value: "FEFO" },
            ]}
          />

          <RhfTextArea
            name="description"
            control={control}
            label="Description"
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
