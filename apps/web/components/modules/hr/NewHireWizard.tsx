"use client";

import React, { useState } from "react";
import { Steps, Form, Input, DatePicker, Select, Button, InputNumber, Card, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  createEmployeeSchema, 
  employeePersonalSchema, 
  employmentDetailsSchema, 
  compensationDetailsSchema 
} from "@repo/shared-schemas";
import { useCreateEmployeeMutation, useGetDepartmentsQuery } from "@/store/api/hrApi";
import { useGetBranchesQuery } from "@/store/api/systemApi";
import dayjs from "dayjs";

export const NewHireWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: branches } = useGetBranchesQuery();

  // We use separate forms or a combined one. 
  // For a wizard, it's often better to have one combined form state.
  const { control, handleSubmit, trigger, formState: { errors }, watch } = useForm({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeCode: "",
      departmentId: "",
      designation: "",
      employmentType: "FULL_TIME",
      joinDate: dayjs().toISOString(),
      baseSalary: 0,
      currency: "USD",
      paymentFrequency: "MONTHLY",
      branchId: "",
    } as any,
  });

  const next = async () => {
    // Validate current step fields
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = Object.keys(employeePersonalSchema.shape);
    } else if (currentStep === 1) {
      fieldsToValidate = Object.keys(employmentDetailsSchema.shape);
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (data: any) => {
    try {
      await createEmployee(data).unwrap();
      message.success("Employee hired successfully!");
      // Redirect or reset
    } catch (err: any) {
      message.error(err.data?.message || "Failed to hire employee");
    }
  };

  const steps = [
    {
      title: "Personal Info",
      content: (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="First Name" validateStatus={errors.firstName ? "error" : ""} help={errors.firstName?.message as string}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => <Input {...field} placeholder="John" />}
              />
            </Form.Item>
            <Form.Item label="Last Name" validateStatus={errors.lastName ? "error" : ""} help={errors.lastName?.message as string}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Doe" />}
              />
            </Form.Item>
          </div>
          <Form.Item label="Email" validateStatus={errors.email ? "error" : ""} help={errors.email?.message as string}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} type="email" placeholder="john.doe@company.com" />}
            />
          </Form.Item>
          <Form.Item label="Phone" validateStatus={errors.phone ? "error" : ""} help={errors.phone?.message as string}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input {...field} placeholder="+1 234 567 890" />}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Employment",
      content: (
        <div className="space-y-4 py-4">
          <Form.Item label="Employee Code" validateStatus={errors.employeeCode ? "error" : ""} help={errors.employeeCode?.message as string}>
            <Controller
              name="employeeCode"
              control={control}
              render={({ field }) => <Input {...field} placeholder="EMP-001" />}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Branch" validateStatus={errors.branchId ? "error" : ""} help={errors.branchId?.message as string}>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="Select Branch">
                    {branches?.map((b: any) => (
                      <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
            <Form.Item label="Department" validateStatus={errors.departmentId ? "error" : ""} help={errors.departmentId?.message as string}>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="Select Department">
                    {departments?.map((d: any) => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </div>
          <Form.Item label="Designation" validateStatus={errors.designation ? "error" : ""} help={errors.designation?.message as string}>
            <Controller
              name="designation"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Software Engineer" />}
            />
          </Form.Item>
          <Form.Item label="Join Date" validateStatus={errors.joinDate ? "error" : ""} help={errors.joinDate?.message as string}>
            <Controller
              name="joinDate"
              control={control}
              render={({ field }) => (
                <DatePicker 
                  className="w-full" 
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toISOString())} 
                />
              )}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Compensation",
      content: (
        <div className="space-y-4 py-4">
          <Form.Item label="Base Salary" validateStatus={errors.baseSalary ? "error" : ""} help={errors.baseSalary?.message as string}>
            <Controller
              name="baseSalary"
              control={control}
              render={({ field }) => <InputNumber {...field} className="w-full" prefix="$" placeholder="5000" />}
            />
          </Form.Item>
          <Form.Item label="Payment Frequency" validateStatus={errors.paymentFrequency ? "error" : ""} help={errors.paymentFrequency?.message as string}>
            <Controller
              name="paymentFrequency"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Select.Option value="MONTHLY">Monthly</Select.Option>
                  <Select.Option value="WEEKLY">Weekly</Select.Option>
                  <Select.Option value="BI_WEEKLY">Bi-Weekly</Select.Option>
                </Select>
              )}
            />
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <Card title="New Hire Wizard" className="max-w-2xl mx-auto shadow-lg">
      <Steps current={currentStep} items={steps.map(item => ({ title: item.title }))} />
      <Form layout="vertical" className="mt-8">
        <div className="steps-content">{steps[currentStep]?.content}</div>
        <div className="steps-action flex justify-end gap-2 mt-8">
          {currentStep > 0 && (
            <Button onClick={() => prev()}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleSubmit(onFinish)} loading={isLoading}>
              Hire Employee
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};
