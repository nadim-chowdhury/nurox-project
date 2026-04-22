"use client";

import React from "react";
import { Modal, Form, Select, Input, Button, Space, message, InputNumber, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAddOKRMutation, useGetEmployeesQuery } from "@/store/api/hrApi";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AddOkrModal: React.FC<Props> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [addOKR, { isLoading }] = useAddOKRMutation();
  const { data: employees } = useGetEmployeesQuery({});

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await addOKR({
        id: values.employeeId,
        data: values,
      }).unwrap();
      message.success("OKR created successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create OKR");
    }
  };

  return (
    <Modal
      title="Create New OKR"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
          <Select 
            showSearch
            placeholder="Select employee"
            options={employees?.data.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item name="objective" label="Objective" rules={[{ required: true }]}>
          <Input placeholder="e.g. Scale engineering team output by 20%" />
        </Form.Item>
        <Form.Item name="period" label="Period" rules={[{ required: true }]}>
          <Select options={[
            { value: "Q1 2026", label: "Q1 2026" },
            { value: "Q2 2026", label: "Q2 2026" },
            { value: "Q3 2026", label: "Q3 2026" },
            { value: "Q4 2026", label: "Q4 2026" },
          ]} />
        </Form.Item>

        <Divider titlePlacement="left">Key Results</Divider>
        
        <Form.List name="keyResults">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    rules={[{ required: true, message: 'Missing description' }]}
                    style={{ width: 300 }}
                  >
                    <Input placeholder="Key Result Description" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'targetValue']}
                    rules={[{ required: true, message: 'Missing target' }]}
                  >
                    <InputNumber placeholder="Target" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'weight']}
                    rules={[{ required: true, message: 'Missing weight' }]}
                  >
                    <InputNumber placeholder="Weight %" min={0} max={100} />
                  </Form.Item>
                  <DeleteOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Key Result
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
