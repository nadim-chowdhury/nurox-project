"use client";

import React from "react";
import { Form, TimePicker, TimePickerProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import dayjs from "dayjs";

interface RhfTimePickerProps<T extends FieldValues> extends TimePickerProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfTimePicker<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfTimePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, onChange, ...field },
        fieldState: { error },
      }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={error ? "error" : ""}
          help={error?.message || help}
        >
          <TimePicker
            {...field}
            {...props}
            value={value ? dayjs(value) : null}
            onChange={(time) => onChange(time ? time.toISOString() : null)}
            style={{ width: "100%", ...props.style }}
          />
        </Form.Item>
      )}
    />
  );
}
