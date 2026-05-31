"use client";

import React, { useEffect, useState } from "react";
import { Tldraw, useEditor, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Badge, Space, Typography, Avatar, Tooltip } from "antd";

const { Text } = Typography;

interface CollaborativeWhiteboardProps {
  documentId: string;
}

export function CollaborativeWhiteboard({
  documentId,
}: CollaborativeWhiteboardProps) {
  const { ydoc, provider, activeUsers, currentUser } =
    useCollaboration(documentId);
  const [store] = useState(() =>
    createTLStore({ shapeUtils: defaultShapeUtils }),
  );

  useEffect(() => {
    if (!ydoc || !provider) return;

    const yStore = ydoc.getMap("whiteboard_store");

    // Sync tldraw store with Yjs
    // Note: In a production app, we'd use a more robust sync helper like @tldraw/yjs
    // For this prototype, we'll implement a basic sync logic or use the standard Tldraw collaboration pattern.

    const unsubs: (() => void)[] = [];

    // Sync from tldraw to Yjs
    unsubs.push(
      store.listen((entry) => {
        if (entry.source !== "user") return;

        ydoc.transact(() => {
          Object.entries(entry.changes.added).forEach(([id, record]) => {
            yStore.set(id, record);
          });
          Object.entries(entry.changes.updated).forEach(
            ([id, [_old, record]]) => {
              yStore.set(id, record);
            },
          );
          Object.keys(entry.changes.removed).forEach((id) => {
            yStore.delete(id);
          });
        }, "yjs");
      }),
    );

    // Sync from Yjs to tldraw
    const handleYjsUpdate = (events: any) => {
      store.mergeRemoteChanges(() => {
        events.changes.keys.forEach((change: any, key: string) => {
          if (change.action === "add" || change.action === "update") {
            const record = yStore.get(key);
            store.put([record as any]);
          } else if (change.action === "delete") {
            store.remove([key as any]);
          }
        });
      });
    };

    yStore.observe(handleYjsUpdate);

    // Initial load
    store.put(Array.from(yStore.values()) as any[]);

    return () => {
      unsubs.forEach((fn) => fn());
      yStore.unobserve(handleYjsUpdate);
    };
  }, [ydoc, provider, store]);

  return (
    <div
      className="collaborative-whiteboard-container"
      style={{ height: "600px", display: "flex", flexDirection: "column" }}
    >
      <div
        className="whiteboard-header"
        style={{
          padding: "12px 16px",
          background: "var(--color-surface-container-low)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid var(--color-border)",
          borderBottom: "none",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Space size={16}>
          <Badge
            status="processing"
            text={<Text strong>Workflow Whiteboard</Text>}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Collaborative Process Mapping
          </Text>
        </Space>

        <div className="presence-indicators">
          <Avatar.Group max={{ count: 3 }}>
            {activeUsers.map((userId) => (
              <Tooltip key={userId} title={`User: ${userId}`}>
                <Avatar style={{ backgroundColor: "#52c41a" }}>
                  {userId?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid var(--color-border)",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Tldraw store={store} />
      </div>

      <style jsx global>{`
        .tl-container {
          background-color: var(--color-surface) !important;
        }
      `}</style>
    </div>
  );
}
