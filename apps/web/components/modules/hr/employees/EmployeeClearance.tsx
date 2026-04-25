"use client";

import React from "react";
import { Table, Checkbox, message, Input, Space, Typography } from "antd";
import { 
  useGetClearanceChecklistQuery, 
  useUpdateClearanceItemMutation 
} from "@/store/api/hrApi";
import { formatDate } from "@/lib/utils";

const { Text } = Typography;

interface Props {
  employeeId: string;
}

export function EmployeeClearance({ employeeId }: Props) {
  const { data: checklist, isLoading } = useGetClearanceChecklistQuery(employeeId);
  const [updateItem] = useUpdateClearanceItemMutation();

  const handleStatusChange = async (id: string, isCleared: boolean) => {
    try {
      await updateItem({ id, isCleared }).unwrap();
      message.success("Clearance status updated");
    } catch {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "Item / Department",
      dataIndex: "itemName",
      key: "itemName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "isCleared",
      key: "isCleared",
      width: 100,
      render: (isCleared: boolean, record: any) => (
        <Checkbox 
          checked={isCleared} 
          onChange={(e) => handleStatusChange(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Cleared Date",
      dataIndex: "clearedAt",
      key: "clearedAt",
      width: 150,
      render: (date: string) => date ? formatDate(date) : "-",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (text: string, record: any) => (
        <Input 
          defaultValue={text} 
          placeholder="Add notes..."
          onBlur={(e) => updateItem({ id: record.id, isCleared: record.isCleared, remarks: e.target.value })}
        />
      ),
    },
  ];

  return (
    <Table
      loading={isLoading}
      dataSource={checklist}
      columns={columns}
      rowKey="id"
      pagination={false}
      size="small"
      style={{ background: 'transparent' }}
    />
  );
}
