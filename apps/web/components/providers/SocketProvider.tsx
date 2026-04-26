"use client";

import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { notificationApi } from "@/store/api/notificationApi";
import { setSocketStatus } from "@/store/slices/uiSlice";
import { notification as antdNotification } from "antd";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken: token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (token && user) {
      dispatch(setSocketStatus("connecting"));
      const socket = getSocket(token);

      if (socket) {
        if (socket.connected) {
          dispatch(setSocketStatus("connected"));
        }

        socket.on("connect", () => {
          dispatch(setSocketStatus("connected"));
        });

        socket.on("disconnect", () => {
          dispatch(setSocketStatus("disconnected"));
        });

        socket.on("connect_error", () => {
          dispatch(setSocketStatus("disconnected"));
        });

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
        dispatch(setSocketStatus("disconnected"));
      }
    };
  }, [token, user, dispatch]);

  return <>{children}</>;
}
