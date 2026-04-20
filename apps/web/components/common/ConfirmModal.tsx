"use client";

import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

/**
 * Wrapper around antd Modal.confirm for consistent delete/action confirmations.
 *
 * @example
 * confirmModal({
 *   title: "Delete Employee",
 *   content: "This action cannot be undone.",
 *   onOk: () => deleteEmployee(id),
 * });
 */

interface ConfirmModalOptions {
  title: string;
  content: string;
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function confirmModal({
  title,
  content,
  onOk,
  onCancel,
  okText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmModalOptions) {
  const isDanger = type === "danger";

  Modal.confirm({
    title,
    content,
    icon: (
      <ExclamationCircleOutlined
        style={{ color: isDanger ? "#ffb4ab" : "#ffb347" }}
      />
    ),
    okText,
    cancelText,
    okButtonProps: {
      danger: isDanger,
      style: isDanger
        ? { background: "#93000a", borderColor: "#93000a" }
        : undefined,
    },
    onOk,
    onCancel,
    centered: true,
    maskClosable: true,
  });
}
