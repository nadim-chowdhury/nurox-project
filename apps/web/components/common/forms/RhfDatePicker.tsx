"use client";

import React from "react";
import { Form, DatePicker, DatePickerProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import dayjs from "dayjs";

interface RhfDatePickerProps<T extends FieldValues> extends DatePickerProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfDatePickerProps<T>) {
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
          <DatePicker
            {...field}
            {...props}
            value={
              value
                ? dayjs.isDayjs(value)
                  ? value
                  : dayjs(value).isValid()
                    ? dayjs(value)
                    : null
                : null
            }
            onChange={(date) =>
              onChange(
                date &&
                  !Array.isArray(date) &&
                  dayjs.isDayjs(date) &&
                  date.isValid()
                  ? date.toISOString()
                  : null,
              )
            }
            style={{ width: "100%", ...props.style }}
          />
        </Form.Item>
      )}
    />
  );
}
