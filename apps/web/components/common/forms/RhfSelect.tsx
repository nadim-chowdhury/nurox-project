"use client";

import React from "react";
import { Form, Select, SelectProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface RhfSelectProps<T extends FieldValues> extends SelectProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfSelect<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={error ? "error" : ""}
          help={error?.message || help}
        >
          <Select {...field} {...props} />
        </Form.Item>
      )}
    />
  );
}
