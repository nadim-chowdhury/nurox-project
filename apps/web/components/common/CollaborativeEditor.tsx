"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Avatar, Tooltip, Space, Badge } from "antd";

interface CollaborativeEditorProps {
  documentId: string;
}

export function CollaborativeEditor({ documentId }: CollaborativeEditorProps) {
  const { provider, ydoc, activeUsers, currentUser } =
    useCollaboration(documentId);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // Collaboration handled by Yjs
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: `${currentUser?.firstName} ${currentUser?.lastName}`,
            color: "#f783ac", // In a real app, generate based on userId
          },
        }),
      ],
    },
    [provider],
  );

  if (!editor) return null;

  return (
    <div
      className="collaborative-editor-container"
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        className="editor-toolbar"
        style={{
          padding: "8px 16px",
          background: "var(--color-surface-container-low)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="format-tools">
          <Space>
            <Badge status="processing" text="Live" />
          </Space>
        </div>

        <div className="presence-indicators">
          <Avatar.Group
            max={{
              count: 3,
              style: { color: "#f56a00", backgroundColor: "#fde3cf" },
            }}
          >
            {activeUsers.map((userId) => (
              <Tooltip key={userId} title={`User ID: ${userId}`}>
                <Avatar style={{ backgroundColor: "#87d068" }}>
                  {userId[0].toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>
      </div>

      <div style={{ padding: 24, minHeight: 400 }}>
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .collaboration-cursor__caret {
          border-left: 2px solid #0d0d0d;
          border-right: 2px solid #0d0d0d;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          position: relative;
          word-break: normal;
        }
        .collaboration-cursor__label {
          border-radius: 3px 3px 3px 0;
          color: #fff;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          left: -1px;
          line-height: normal;
          padding: 0.1rem 0.3rem;
          position: absolute;
          top: -1.4rem;
          user-select: none;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
