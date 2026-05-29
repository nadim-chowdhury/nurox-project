"use client";

import React from "react";
import { Form, DatePicker, GetProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import dayjs from "dayjs";

// Extracting types from DatePicker.RangePicker
type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;

interface RhfRangePickerProps<T extends FieldValues> extends RangePickerProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function RhfRangePicker<T extends FieldValues>({
  name,
  control,
  label,
  required,
  help,
  ...props
}: RhfRangePickerProps<T>) {
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
          <DatePicker.RangePicker
            {...field}
            {...props}
            value={value ? [dayjs(value[0]), dayjs(value[1])] : null}
            onChange={(dates) => {
              if (dates) {
                onChange([dates[0]?.toISOString(), dates[1]?.toISOString()]);
              } else {
                onChange(null);
              }
            }}
            style={{ width: "100%", ...props.style }}
          />
        </Form.Item>
      )}
    />
  );
}
