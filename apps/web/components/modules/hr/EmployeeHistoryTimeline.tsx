"use client";

import React from "react";
import { Timeline, Card, Typography, Spin, Empty, Tag } from "antd";
import { useGetEmployeeHistoryQuery } from "@/store/api/hrApi";
import dayjs from "dayjs";

const { Text } = Typography;

interface Props {
  employeeId: string;
}

const eventColors: Record<string, string> = {
  HIRED: "green",
  PROMOTED: "gold",
  TRANSFERRED: "blue",
  DESIGNATION_CHANGE: "cyan",
  SALARY_REVISION: "purple",
  PROBATION_COMPLETED: "geekblue",
  SUSPENDED: "red",
  RESIGNED: "volcano",
  TERMINATED: "magenta",
};

export const EmployeeHistoryTimeline: React.FC<Props> = ({ employeeId }) => {
  const { data: history, isLoading } = useGetEmployeeHistoryQuery(employeeId);

  if (isLoading) return <Spin className="w-full py-10" />;
  if (!history || history.length === 0) return <Empty description="No history found" />;

  return (
    <Card title="Employment History" className="shadow-sm">
      <Timeline mode="left" className="mt-4">
        {history.map((event) => (
          <Timeline.Item 
            key={event.id} 
            color={eventColors[event.event] || "gray"}
            label={<Text type="secondary">{dayjs(event.effectiveDate).format("MMM DD, YYYY")}</Text>}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Text strong>{event.event.replace("_", " ")}</Text>
                <Tag color={eventColors[event.event]}>{event.event}</Tag>
              </div>
              {event.designation && (
                <Text type="secondary">Designation: {event.designation.title}</Text>
              )}
              {event.department && (
                <Text type="secondary">Department: {event.department.name}</Text>
              )}
              {event.comments && (
                <Text className="mt-1 italic">{event.comments}</Text>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};
