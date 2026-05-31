"use client";

import { useEffect, useState, useMemo } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAppSelector } from "@/hooks/useRedux";
import { getSocket } from "@/lib/socket";

export function useCollaboration(documentId: string) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!documentId || !token) return;

    // Set up Hocuspocus provider for Yjs sync
    const hpProvider = new HocuspocusProvider({
      url: process.env.NEXT_PUBLIC_COLLAB_URL || "ws://localhost:3002",
      name: documentId,
      document: ydoc,
      token: token,
      onConnect() {
        console.log("Connected to collaboration server");
      },
    });

    setProvider(hpProvider);

    // Set up Socket.io for high-level presence and signaling
    const socket = getSocket(token, "collaboration");
    if (socket) {
      socket.emit("joinDocument", { documentId });

      socket.on("presence", (data: { activeUsers: string[] }) => {
        setActiveUsers(data.activeUsers);
      });
    }

    return () => {
      hpProvider.destroy();
      socket?.emit("leaveDocument", { documentId });
      socket?.off("presence");
    };
  }, [documentId, token, ydoc]);

  return {
    ydoc,
    provider,
    activeUsers,
    currentUser: user,
  };
}
