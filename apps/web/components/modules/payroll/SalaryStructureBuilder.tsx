"use client";

import React, { useState } from "react";
import { Form, Input, Select, Button, Space, Card, InputNumber, Switch, Table, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCreateStructureMutation } from "@/store/api/payrollApi";

export const SalaryStructureBuilder: React.FC = () => {
  const [form] = Form.useForm();
  const [createStructure, { isLoading }] = useCreateStructureMutation();

  const onFinish = async (values: any) => {
    try {
      await createStructure(values).unwrap();
      message.success("Salary structure created successfully!");
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create structure");
    }
  };

  return (
    <Card title="Salary Structure Builder" className="shadow-lg max-w-4xl mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ components: [{ name: "Basic", type: "EARNING", amountType: "PERCENTAGE", value: 100, isTaxable: true }] }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="name" label="Structure Name" rules={[{ required: true }]}>
            <Input placeholder="Standard Corporate Structure" />
          </Form.Item>
          <Form.Item name="isDefault" label="Set as Default" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Divider orientation="left">Components</Divider>

        <Form.List name="components">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[{ required: true, message: "Missing component name" }]}
                  >
                    <Input placeholder="Component Name (e.g. HRA)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    rules={[{ required: true }]}
                  >
                    <Select style={{ width: 130 }}>
                      <Select.Option value="EARNING">Earning</Select.Option>
                      <Select.Option value="DEDUCTION">Deduction</Select.Option>
                      <Select.Option value="STATUTORY">Statutory</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "amountType"]}
                    rules={[{ required: true }]}
                  >
                    <Select style={{ width: 120 }}>
                      <Select.Option value="FIXED">Fixed</Select.Option>
                      <Select.Option value="PERCENTAGE">% of Base</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    rules={[{ required: true }]}
                  >
                    <InputNumber placeholder="Value" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "isTaxable"]}
                    valuePropName="checked"
                    label="Tax"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <DeleteOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Component
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item className="mt-8 text-right">
          <Button type="primary" htmlType="submit" loading={isLoading} size="large">
            Save Salary Structure
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
