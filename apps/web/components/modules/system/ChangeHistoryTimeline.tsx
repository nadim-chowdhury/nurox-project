"use client";

import React from "react";
import { Timeline, Typography, Tag, Spin, Empty } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const { Text } = Typography;

interface ChangeHistoryTimelineProps {
  entityType: string;
  entityId: string;
}

export function ChangeHistoryTimeline({
  entityType,
  entityId,
}: ChangeHistoryTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-history", entityType, entityId],
    queryFn: async () => {
      const params = new URLSearchParams({
        module: "SYSTEM", // or abstract this if needed
        limit: "100", // fetching a reasonable history depth
      });
      // Currently API doesn't support direct entityId filtering via query param,
      // but assuming it's added or we fetch and filter locally for demo
      const res = await axios.get(`/api/admin/audit-logs?${params.toString()}`);

      // Filter locally for now, ideally API should support `?entityId=`
      return res.data.data.filter(
        (log: any) =>
          log.entityId === entityId && log.entityType === entityType,
      );
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <Spin />
      </div>
    );
  if (!data || data.length === 0)
    return <Empty description="No change history found" />;

  const timelineItems = data.map((log: any) => {
    let color = "blue";
    if (log.action === "UPDATE") color = "orange";
    if (log.action === "INSERT") color = "green";

    // Parse oldValue and newValue
    const oldVal = log.oldValue || {};
    const newVal = log.newValue || {};
    const changedKeys = Object.keys(newVal);

    return {
      dot: <ClockCircleOutlined style={{ fontSize: "16px" }} />,
      color: color,
      children: (
        <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <Tag color={color}>{log.action}</Tag>
              <Text type="secondary" className="text-xs">
                {new Date(log.createdAt).toLocaleString()}
              </Text>
            </div>
            <Text type="secondary" className="text-xs">
              By: {log.userId}
            </Text>
          </div>

          {log.action === "UPDATE" && changedKeys.length > 0 && (
            <div className="mt-2 text-sm bg-white p-2 rounded border border-gray-200">
              <Text strong className="block mb-1 text-gray-600">
                Changed Fields:
              </Text>
              <ul className="list-none p-0 m-0 space-y-1">
                {changedKeys.map((key) => (
                  <li
                    key={key}
                    className="flex gap-2 font-mono text-xs items-center"
                  >
                    <span className="text-gray-500 font-semibold">{key}:</span>
                    <span
                      className="text-red-400 line-through truncate max-w-[150px]"
                      title={JSON.stringify(oldVal[key])}
                    >
                      {JSON.stringify(oldVal[key])}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span
                      className="text-green-500 truncate max-w-[150px]"
                      title={JSON.stringify(newVal[key])}
                    >
                      {JSON.stringify(newVal[key])}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {log.action === "INSERT" && (
            <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
              Record initially created.
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <Timeline mode="left" items={timelineItems} className="mt-4" />
    </div>
  );
}
