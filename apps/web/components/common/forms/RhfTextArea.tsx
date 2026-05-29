"use client";

import React from "react";
import { Form, Input } from "antd";
import { TextAreaProps } from "antd/es/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

const { TextArea } = Input;

interface RhfTextAreaProps<T extends FieldValues> extends TextAreaProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfTextArea<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfTextAreaProps<T>) {
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
          <TextArea {...field} {...props} />
        </Form.Item>
      )}
    />
  );
}
