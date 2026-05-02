import { io, Socket } from "socket.io-client";

const sockets: Record<string, Socket> = {};

export const getSocket = (token?: string, namespace = "notifications"): Socket | null => {
  if (typeof window === "undefined") return null;

  const url = `${process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"}/${namespace}`;
  
  if (!sockets[namespace]) {
    sockets[namespace] = io(url, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    sockets[namespace].on("connect", () => {
      console.log(`Socket connected to ${namespace}`);
    });

    sockets[namespace].on("disconnect", () => {
      console.log(`Socket disconnected from ${namespace}`);
    });
  }
  return sockets[namespace];
};

export const disconnectSocket = (namespace?: string) => {
  if (namespace) {
    if (sockets[namespace]) {
      sockets[namespace].disconnect();
      delete sockets[namespace];
    }
  } else {
    Object.keys(sockets).forEach((ns) => {
      sockets[ns].disconnect();
      delete sockets[ns];
    });
  }
};
