"use client";

import React from "react";
import { Typography, Card, Alert } from "antd";
import { CollaborativeEditor } from "@/components/common/CollaborativeEditor";
import { CollaborativeSpreadsheet } from "@/components/common/CollaborativeSpreadsheet";
import { CollaborativeWhiteboard } from "@/components/common/CollaborativeWhiteboard";

const { Title, Paragraph } = Typography;

export default function CollabTestPage() {
  // Mock document IDs for testing
  const editorDocId = "test-collab-editor-123";
  const spreadsheetDocId = "test-collab-sheet-456";
  const whiteboardDocId = "test-collab-board-789";

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Real-time Collaboration Test Suite</Title>
      <Paragraph>
        This suite demonstrates real-time collaborative editing using Yjs and
        Hocuspocus. Open this page in multiple tabs or browsers to see
        synchronisation across text, data, and visual layers.
      </Paragraph>

      <Alert
        message="Development Preview"
        description="Collaboration is currently in preview. Changes are persisted to the database as binary Yjs updates."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <Card title="Shared Document">
            <CollaborativeEditor documentId={editorDocId} />
          </Card>

          <Card title="Shared Spreadsheet (Financial Modeling)">
            <CollaborativeSpreadsheet documentId={spreadsheetDocId} />
          </Card>
        </div>

        <Card title="Collaborative Whiteboard (Workflow Mapping)">
          <CollaborativeWhiteboard documentId={whiteboardDocId} />
        </Card>
      </div>
    </div>
  );
}
