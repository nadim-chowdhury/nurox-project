"use client";

import React from "react";
import { Form, Input, InputProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface RhfInputProps<T extends FieldValues> extends InputProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfInputProps<T>) {
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
          <Input {...field} {...props} />
        </Form.Item>
      )}
    />
  );
}
