"use client";

import React, { useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message, Tree, Card, Row, Col } from "antd";
import { PlusOutlined, ShopOutlined, PartitionOutlined, BuildOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetWarehousesQuery, useCreateWarehouseMutation } from "@/store/api/inventoryApi";

export default function WarehousesPage() {
  const { data: warehouses, isLoading } = useGetWarehousesQuery();
  const [createWarehouse] = useCreateWarehouseMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createWarehouse(values).unwrap();
      message.success("Warehouse registered");
      setIsModalVisible(false);
      form.resetFields();
    } catch (_error) {
      message.error("Failed to register warehouse");
    }
  };

  const columns = [
    {
      title: "Warehouse Name",
      dataIndex: "name",
      key: "name",
      render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, _record: any) => `${_record.city || ""}, ${_record.country || ""}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, _record: any) => (
        <Space>
          <Button icon={<PartitionOutlined />} size="small">Layout</Button>
          <Button type="link" size="small">Details</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Warehouses"
        subtitle="Manage storage locations and bin hierarchy"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Warehouses" },
        ]}
        extra={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            New Warehouse
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Table
            dataSource={warehouses}
            columns={columns}
            loading={isLoading}
            rowKey="id"
          />
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Storage Hierarchy (Structure)">
            <p style={{ fontSize: 12, color: "gray", marginBottom: 16 }}>
              Visual map of Zone → Rack → Bin assignments.
            </p>
            <Tree
              showIcon
              defaultExpandAll
              treeData={[
                {
                  title: "Warehouse Alpha",
                  key: "wh-1",
                  icon: <ShopOutlined />,
                  children: [
                    {
                      title: "Cold Zone (Z1)",
                      key: "z-1",
                      icon: <PartitionOutlined />,
                      children: [
                        { title: "Rack A1", key: "r-1", icon: <BuildOutlined /> },
                        { title: "Rack A2", key: "r-2", icon: <BuildOutlined /> },
                      ],
                    },
                    {
                      title: "Ambient Zone (Z2)",
                      key: "z-2",
                      icon: <PartitionOutlined />,
                    },
                  ],
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Register Warehouse"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Warehouse Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Central Distribution Center" />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="CDC-01" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
