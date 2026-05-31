"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { HyperFormula } from "hyperformula";
import "handsontable/styles/handsontable.min.css";
import * as Y from "yjs";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Badge, Space, Tag, Tooltip, Avatar, Typography } from "antd";

// register Handsontable's modules
registerAllModules();

const { Text } = Typography;

interface CollaborativeSpreadsheetProps {
  documentId: string;
}

export function CollaborativeSpreadsheet({
  documentId,
}: CollaborativeSpreadsheetProps) {
  const { ydoc, provider, activeUsers, currentUser } =
    useCollaboration(documentId);
  const hotRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Yjs shared types
  const cellsMap = ydoc.getMap("spreadsheet_cells");
  const locksMap = ydoc.getMap("spreadsheet_locks");

  const [data, setData] = useState<any[][]>(
    Array.from({ length: 20 }, () => Array(10).fill("")),
  );

  // Sync Yjs map to local state
  useEffect(() => {
    const handleUpdate = () => {
      const newData = Array.from({ length: 20 }, () => Array(10).fill(""));
      cellsMap.forEach((val: any, key: string) => {
        const match = key.match(/R(\d+)C(\d+)/);
        if (match && match[1] && match[2]) {
          const row = parseInt(match[1]);
          const col = parseInt(match[2]);
          if (row < 20 && col < 10 && newData[row]) {
            newData[row][col] = val.value;
          }
        }
      });
      setData(newData);
    };

    cellsMap.observe(handleUpdate);
    handleUpdate();

    return () => {
      cellsMap.unobserve(handleUpdate);
    };
  }, [cellsMap]);

  const onAfterChange = useCallback(
    (changes: any, source: string) => {
      if (source === "loadData" || source === "yjs") return;

      ydoc.transact(() => {
        changes.forEach(([row, col, oldValue, newValue]: any) => {
          if (oldValue === newValue) return;

          const key = `R${row}C${col}`;
          // Check if cell is locked by someone else
          const lock = locksMap.get(key);
          if (lock && lock !== currentUser?.id) {
            console.warn(`Cell ${key} is locked by ${lock}`);
            return;
          }

          cellsMap.set(key, {
            value: newValue,
            userId: currentUser?.id,
            timestamp: Date.now(),
          });
        });
      }, "yjs");
    },
    [cellsMap, locksMap, currentUser, ydoc],
  );

  const onAfterSelection = useCallback(
    (row: number, col: number) => {
      if (!currentUser?.id) return;
      const key = `R${row}C${col}`;
      locksMap.set(key, currentUser?.id);

      // Clear other locks held by this user (simple selection model)
      locksMap.forEach((userId: any, lockKey: string) => {
        if (userId === currentUser?.id && lockKey !== key) {
          locksMap.delete(lockKey);
        }
      });
    },
    [locksMap, currentUser],
  );

  return (
    <div className="collaborative-spreadsheet-container">
      <div
        className="spreadsheet-header"
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
            text={<Text strong>Live Financial Model</Text>}
          />
          <Tag color="blue">Formula Engine Active</Tag>
        </Space>

        <div className="presence-indicators">
          <Avatar.Group max={{ count: 3 }}>
            {activeUsers.map((userId) => (
              <Tooltip key={userId} title={`User: ${userId}`}>
                <Avatar style={{ backgroundColor: "#1890ff" }}>
                  {userId?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--color-border)",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          overflow: "hidden",
        }}
      >
        <HotTable
          ref={hotRef}
          data={data}
          rowHeaders={true}
          colHeaders={true}
          height="400"
          width="100%"
          licenseKey="non-commercial-and-evaluation"
          afterChange={onAfterChange}
          afterSelection={onAfterSelection}
          formulas={{
            engine: HyperFormula,
          }}
          contextMenu={true}
          stretchH="all"
          manualColumnResize={true}
          manualRowResize={true}
          cells={(row, col) => {
            const key = `R${row}C${col}`;
            const lock = locksMap.get(key);
            if (lock && lock !== currentUser?.id) {
              return {
                readOnly: true,
                className: "cell-locked",
              };
            }
            return {};
          }}
        />
      </div>

      <style jsx global>{`
        .cell-locked {
          background-color: #fff1f0 !important;
          color: #cf1322 !important;
          cursor: not-allowed !important;
        }
        .handsontable th,
        .handsontable td {
          border-color: var(--color-border-variant) !important;
        }
      `}</style>
    </div>
  );
}
