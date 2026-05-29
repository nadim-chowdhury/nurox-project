"use client";

import React from "react";
import { Form, InputNumber, InputNumberProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface RhfInputNumberProps<T extends FieldValues> extends InputNumberProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfInputNumber<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfInputNumberProps<T>) {
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
          <InputNumber
            {...field}
            {...props}
            style={{ width: "100%", ...props.style }}
          />
        </Form.Item>
      )}
    />
  );
}
