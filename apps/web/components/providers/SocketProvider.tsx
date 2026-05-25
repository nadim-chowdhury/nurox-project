"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { message } from "antd";
import { notificationApi } from "@/store/api/notificationApi";
import { useDispatch } from "react-redux";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    // We assume backend WS is on same domain or we can pass an env var.
    // Usually it's process.env.NEXT_PUBLIC_API_URL
    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const socketInstance = io(socketUrl, {
      auth: { token }, // JWT for authentication in handleConnection
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("notification", (payload) => {
      // Show toast
      message.info({
        content: payload.title,
        description: payload.message, // note: antd message only supports content string, we'll just format it
        duration: 5,
      } as any); // using any for description property if we use antd notification instead it would be better

      // Invalidate RTK query to update the Notification Center count
      dispatch(notificationApi.util.invalidateTags(["Notification"]));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
