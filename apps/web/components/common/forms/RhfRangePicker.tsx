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
            value={
              Array.isArray(value) && value.length === 2
                ? [
                    dayjs.isDayjs(value[0])
                      ? value[0]
                      : dayjs(value[0]).isValid()
                        ? dayjs(value[0])
                        : null,
                    dayjs.isDayjs(value[1])
                      ? value[1]
                      : dayjs(value[1]).isValid()
                        ? dayjs(value[1])
                        : null,
                  ]
                : null
            }
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onChange([dates[0].toISOString(), dates[1].toISOString()]);
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
