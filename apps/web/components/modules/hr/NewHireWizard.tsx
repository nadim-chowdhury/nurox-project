"use client";

import React, { useState } from "react";
import { Steps, Form, Button, Card, message } from "antd";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEmployeeSchema,
  employeePersonalSchema,
  employmentDetailsSchema,
  compensationDetailsSchema,
  emergencyContactSchema,
  documentsSchema,
  type CreateEmployeeDto,
} from "@repo/shared-schemas";
import {
  useCreateEmployeeMutation,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetEmployeesQuery,
} from "@/store/api/hrApi";
import { useGetBranchesQuery } from "@/store/api/systemApi";
import { RhfInput } from "@/components/common/forms/RhfInput";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfDatePicker } from "@/components/common/forms/RhfDatePicker";
import { RhfInputNumber } from "@/components/common/forms/RhfInputNumber";
import dayjs from "dayjs";

export const NewHireWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: designations } = useGetDesignationsQuery();
  const { data: branches } = useGetBranchesQuery();
  const { data: employees } = useGetEmployeesQuery({}); // For Manager selection

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CreateEmployeeDto>({
    resolver: zodResolver(createEmployeeSchema) as Resolver<CreateEmployeeDto>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeCode: "",
      departmentId: "",
      designationId: "",
      employmentType: "FULL_TIME",
      joinDate: dayjs().toISOString(),
      baseSalary: 0,
      currency: "USD",
      paymentFrequency: "MONTHLY",
      branchId: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    } as any,
  });

  const next = async () => {
    let fieldsToValidate: any[] = [];
    switch (currentStep) {
      case 0:
        fieldsToValidate = Object.keys(employeePersonalSchema.shape);
        break;
      case 1:
        fieldsToValidate = Object.keys(employmentDetailsSchema.shape);
        break;
      case 2:
        fieldsToValidate = Object.keys(compensationDetailsSchema.shape);
        break;
      case 3:
        fieldsToValidate = Object.keys(emergencyContactSchema.shape);
        break;
      case 4:
        fieldsToValidate = Object.keys(documentsSchema.shape);
        break;
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (data: CreateEmployeeDto) => {
    try {
      await createEmployee(data).unwrap();
      message.success("Employee hired successfully!");
      // Additional logic like redirect or reset can be added here
    } catch (err: any) {
      message.error(err.data?.message || "Failed to hire employee");
    }
  };

  const steps = [
    {
      title: "Personal",
      content: (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <RhfInput
              name="firstName"
              control={control}
              label="First Name"
              placeholder="John"
              required
            />
            <RhfInput
              name="lastName"
              control={control}
              label="Last Name"
              placeholder="Doe"
              required
            />
          </div>
          <RhfInput
            name="email"
            control={control}
            label="Email"
            type="email"
            placeholder="john.doe@company.com"
            required
          />
          <RhfInput
            name="phone"
            control={control}
            label="Phone"
            placeholder="+1 234 567 890"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <RhfSelect
              name="gender"
              control={control}
              label="Gender"
              options={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "OTHER", label: "Other" },
              ]}
            />
            <RhfDatePicker
              name="dateOfBirth"
              control={control}
              label="Date of Birth"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Employment",
      content: (
        <div className="space-y-4 py-4">
          <RhfInput
            name="employeeCode"
            control={control}
            label="Employee Code"
            placeholder="EMP-001"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <RhfSelect
              name="branchId"
              control={control}
              label="Branch"
              required
              options={branches?.map((b: any) => ({
                value: b.id,
                label: b.name,
              }))}
            />
            <RhfSelect
              name="departmentId"
              control={control}
              label="Department"
              required
              options={departments?.map((d: any) => ({
                value: d.id,
                label: d.name,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <RhfSelect
              name="designationId"
              control={control}
              label="Designation"
              required
              options={designations?.map((d: any) => ({
                value: d.id,
                label: d.name,
              }))}
            />
            <RhfSelect
              name="employmentType"
              control={control}
              label="Employment Type"
              required
              options={[
                { value: "FULL_TIME", label: "Full Time" },
                { value: "PART_TIME", label: "Part Time" },
                { value: "CONTRACT", label: "Contract" },
                { value: "INTERN", label: "Intern" },
                { value: "PROBATION", label: "Probation" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <RhfDatePicker
              name="joinDate"
              control={control}
              label="Join Date"
              required
            />
            <RhfSelect
              name="managerId"
              control={control}
              label="Reporting Manager"
              showSearch
              optionFilterProp="children"
              options={employees?.data.map((e: any) => ({
                value: e.id,
                label: `${e.firstName} ${e.lastName}`,
              }))}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Compensation",
      content: (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <RhfInputNumber
              name="baseSalary"
              control={control}
              label="Base Salary"
              prefix="$"
              placeholder="5000"
              required
            />
            <RhfSelect
              name="currency"
              control={control}
              label="Currency"
              required
              options={[
                { value: "USD", label: "USD - US Dollar" },
                { value: "BDT", label: "BDT - Bangladeshi Taka" },
                { value: "EUR", label: "EUR - Euro" },
                { value: "GBP", label: "GBP - British Pound" },
              ]}
            />
          </div>
          <RhfSelect
            name="paymentFrequency"
            control={control}
            label="Payment Frequency"
            required
            options={[
              { value: "MONTHLY", label: "Monthly" },
              { value: "WEEKLY", label: "Weekly" },
              { value: "BI_WEEKLY", label: "Bi-Weekly" },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Emergency",
      content: (
        <div className="space-y-4 py-4">
          <RhfInput
            name="emergencyContactName"
            control={control}
            label="Contact Name"
            placeholder="Jane Doe"
            required
          />
          <RhfInput
            name="emergencyContactPhone"
            control={control}
            label="Contact Phone"
            placeholder="+1 987 654 321"
            required
          />
          <RhfSelect
            name="emergencyContactRelation"
            control={control}
            label="Relationship"
            options={[
              { value: "SPOUSE", label: "Spouse" },
              { value: "PARENT", label: "Parent" },
              { value: "SIBLING", label: "Sibling" },
              { value: "FRIEND", label: "Friend" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </div>
      ),
    },
    {
      title: "Documents",
      content: (
        <div className="space-y-4 py-4">
          <RhfInput
            name="contractUrl"
            control={control}
            label="Contract URL"
            placeholder="https://s3.nurox.app/contracts/..."
          />
          <RhfDatePicker
            name="contractExpiryDate"
            control={control}
            label="Contract Expiry Date"
          />
        </div>
      ),
    },
  ];

  return (
    <Card title="New Hire Wizard" className="max-w-2xl mx-auto shadow-lg">
      <Steps
        current={currentStep}
        items={steps.map((item) => ({ title: item.title }))}
        size="small"
      />
      <Form layout="vertical" className="mt-8">
        <div className="steps-content">{steps[currentStep]?.content}</div>
        <div className="steps-action flex justify-end gap-2 mt-8">
          {currentStep > 0 && <Button onClick={() => prev()}>Previous</Button>}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleSubmit(onFinish)}
              loading={isLoading}
            >
              Hire Employee
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};
