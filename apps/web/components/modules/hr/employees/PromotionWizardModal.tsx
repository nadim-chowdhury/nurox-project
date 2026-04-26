"use client";

import React, { useState } from "react";
import {
  Card,
  Modal,
  Steps,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Row,
  Col,
  Statistic,
  Divider,
  message,
} from "antd";
import {
  RocketOutlined,
  DollarOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { 
  useGetDesignationsQuery, 
  useCreateSalaryRevisionMutation 
} from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

const { TextArea } = Input;

export function PromotionWizardModal({ employee, open, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { data: designations } = useGetDesignationsQuery();
  const [createRevision, { isLoading }] = useCreateSalaryRevisionMutation();

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (err) {
      // Validation failed
    }
  };

  const handlePrev = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        employeeId: employee.id,
        proposedSalary: values.proposedSalary,
        proposedDesignationId: values.proposedDesignationId,
        effectiveDate: values.effectiveDate.toISOString(),
        reason: values.reason || "PROMOTION",
        comments: values.comments,
      };

      await createRevision(payload).unwrap();
      message.success("Promotion request submitted for approval");
      onClose();
      setCurrentStep(0);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to submit promotion request");
    }
  };

  const steps = [
    {
      title: "Position",
      icon: <RocketOutlined />,
    },
    {
      title: "Compensation",
      icon: <DollarOutlined />,
    },
    {
      title: "Timeline",
      icon: <CalendarOutlined />,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RocketOutlined style={{ color: 'var(--color-primary)' }} />
          <span>Promotion Wizard: {employee?.firstName} {employee?.lastName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      okText={currentStep === steps.length - 1 ? "Submit Request" : "Next"}
      cancelText={currentStep === 0 ? "Cancel" : "Previous"}
      onOk={currentStep === steps.length - 1 ? handleSubmit : handleNext}
      confirmLoading={isLoading}
      okButtonProps={{ 
        disabled: currentStep === steps.length - 1 && isLoading,
        icon: currentStep === steps.length - 1 ? null : <ArrowRightOutlined />
      }}
      cancelButtonProps={{
        onClick: currentStep === 0 ? onClose : handlePrev
      }}
    >
      <div style={{ margin: "24px 0 32px" }}>
        <Steps current={currentStep} items={steps} size="small" />
      </div>

      <Form form={form} layout="vertical">
        {/* Step 1: Position */}
        {currentStep === 0 && (
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Current Position" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <Statistic title="Designation" value={employee?.designation?.title || "N/A"} valueStyle={{ fontSize: 16 }} />
                <Statistic title="Department" value={employee?.department?.name || "N/A"} valueStyle={{ fontSize: 16 }} style={{ marginTop: 16 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="proposedDesignationId" 
                label="Proposed Designation" 
                rules={[{ required: true, message: 'Please select new designation' }]}
              >
                <Select 
                  placeholder="Select new title"
                  options={designations?.map(d => ({ value: d.id, label: d.title }))}
                />
              </Form.Item>
              <Form.Item name="proposedGradeId" label="Proposed Grade (Optional)">
                <Select placeholder="Select pay grade" options={[]} disabled />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Step 2: Compensation */}
        {currentStep === 1 && (
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Current Salary" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <Statistic 
                  title="Monthly Base" 
                  value={employee?.salary || 0} 
                  prefix="$" 
                  valueStyle={{ color: 'var(--color-on-surface-variant)' }} 
                />
              </Card>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="proposedSalary" 
                label="Proposed New Salary" 
                rules={[{ required: true, message: 'Please enter new salary' }]}
                initialValue={employee?.salary}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item label="Percentage Increase">
                <InputNumber 
                  disabled 
                  style={{ width: '100%' }} 
                  value={form.getFieldValue('proposedSalary') ? Math.round(((form.getFieldValue('proposedSalary') - (employee?.salary || 0)) / (employee?.salary || 1)) * 100) : 0} 
                  formatter={v => `${v}%`}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Step 3: Timeline & Reason */}
        {currentStep === 2 && (
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item 
                  name="effectiveDate" 
                  label="Effective Date" 
                  rules={[{ required: true }]}
                  initialValue={dayjs().startOf('month').add(1, 'month')}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="reason" label="Revision Reason" initialValue="PROMOTION">
                  <Select options={[
                    { value: "PROMOTION", label: "Promotion" },
                    { value: "ANNUAL_REVISION", label: "Annual Revision" },
                    { value: "MARKET_ADJUSTMENT", label: "Market Adjustment" },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="comments" label="Justification / Comments">
              <TextArea rows={4} placeholder="Briefly describe the reason for this promotion..." />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
