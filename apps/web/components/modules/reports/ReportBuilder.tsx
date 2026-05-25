"use client";

import React, { useState } from "react";
import {
  Card,
  Select,
  Button,
  Form,
  Input,
  Space,
  Divider,
  Row,
  Col,
  Typography,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

export function ReportBuilder() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // Transform form values into ReportTemplate schema
      const payload = {
        name: values.name,
        description: values.description,
        module: values.module,
        category: values.category,
        entityName: values.entityName,
        isShared: values.isShared || false,
        config: {
          columns: values.columns || [],
          filters: values.filters || [],
          grouping: values.grouping ? [values.grouping] : [],
          aggregations: values.aggregations || [],
        },
      };

      await axios.post("/api/admin/reports/templates", payload);
      message.success("Report template saved successfully!");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Failed to save report template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm rounded-lg border-gray-100">
      <div className="mb-6">
        <Title level={4}>Report Builder</Title>
        <Text type="secondary">Design custom cross-module reports</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="Report Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Sales by Region" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="module"
              label="Module"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "HR", label: "HR" },
                  { value: "FINANCE", label: "Finance" },
                  { value: "SALES", label: "Sales" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="entityName"
              label="Base Entity"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: "Employee", label: "Employee" },
                  { value: "Invoice", label: "Invoice" },
                  { value: "JournalEntry", label: "Journal Entry" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Columns & Aggregation</Divider>
        <Form.List name="columns">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "key"]}
                    rules={[{ required: true, message: "Missing key" }]}
                  >
                    <Input placeholder="Field Key (e.g. amount)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "label"]}
                    rules={[{ required: true, message: "Missing label" }]}
                  >
                    <Input placeholder="Column Label" />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 cursor-pointer"
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Column
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="grouping" label="Group By Field">
              <Input placeholder="e.g. departmentId" />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="aggregations">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "key"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Field Key (e.g. amount)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Aggregation"
                      style={{ width: 120 }}
                      options={[
                        { value: "SUM", label: "SUM" },
                        { value: "AVG", label: "AVERAGE" },
                        { value: "COUNT", label: "COUNT" },
                      ]}
                    />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 cursor-pointer"
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ width: "50%" }}
                  icon={<PlusOutlined />}
                >
                  Add Aggregation
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider />
        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            Save Report Template
          </Button>
        </div>
      </Form>
    </Card>
  );
}

const MinusCircleOutlined = (props: any) => <DeleteOutlined {...props} />;
