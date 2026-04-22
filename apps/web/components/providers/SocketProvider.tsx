"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { notificationApi } from "@/store/api/notificationApi";
import { message, notification as antdNotification } from "antd";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token && user) {
      // Create or get existing socket
      const socket = getSocket(token);

      if (socket) {
        // Listen for notifications
        socket.on("newNotification", (data: any) => {
          // Invalidate cache so UI refreshes
          dispatch(notificationApi.util.invalidateTags(["Notification"]));
          
          // Show toast notification
          antdNotification.info({
            message: data.title,
            description: data.message,
            placement: "topRight",
          });
        });
      }
    }

    return () => {
      if (token) {
        disconnectSocket();
      }
    };
  }, [token, user, dispatch]);

  return <>{children}</>;
}
