import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket | null => {
  if (!socket && typeof window !== "undefined") {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001/notifications", {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
