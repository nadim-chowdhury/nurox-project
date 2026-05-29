"use client";

import React from "react";
import { Form, Rate, RateProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface RhfRateProps<T extends FieldValues> extends RateProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfRate<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfRateProps<T>) {
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
          <Rate {...field} {...props} />
        </Form.Item>
      )}
    />
  );
}
