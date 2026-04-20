/**
 * Global antd message/notification instance.
 *
 * Why this exists:
 * antd's message.info() and notification.open() need to be called
 * from within a React tree (under ConfigProvider). But in RTK Query
 * onQueryStarted callbacks or service layers, there's no React context.
 *
 * Solution: Use antd's static methods which work outside components.
 * Import from this file for consistent access.
 */
import { message, notification } from "antd";

export const toast = {
  success: (content: string) => message.success(content),
  error: (content: string) => message.error(content),
  warning: (content: string) => message.warning(content),
  info: (content: string) => message.info(content),
  loading: (content: string) => message.loading(content),
};

export const notify = {
  success: (title: string, description?: string) =>
    notification.success({
      message: title,
      description,
      placement: "topRight",
    }),
  error: (title: string, description?: string) =>
    notification.error({
      message: title,
      description,
      placement: "topRight",
    }),
  warning: (title: string, description?: string) =>
    notification.warning({
      message: title,
      description,
      placement: "topRight",
    }),
  info: (title: string, description?: string) =>
    notification.info({
      message: title,
      description,
      placement: "topRight",
    }),
};
