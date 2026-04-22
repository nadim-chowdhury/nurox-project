"use client";

import React, { useState } from "react";
import { Modal, Upload, Button, Space, message, Typography, Table } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { useBulkImportAttendanceMutation } from "@/store/api/attendanceApi";
import Papa from "papaparse";

const { Dragger } = Upload;
const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BulkImportModal({ open, onClose }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [importAttendance, { isLoading }] = useBulkImportAttendanceMutation();

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        message.info(`Loaded ${results.data.length} records`);
      },
      error: (err) => {
        message.error("Failed to parse CSV: " + err.message);
      },
    });
    return false; // Prevent auto upload
  };

  const handleImport = async () => {
    try {
      await importAttendance(data).unwrap();
      message.success(`Successfully imported ${data.length} records`);
      setData([]);
      onClose();
    } catch (err) {
      message.error("Import failed");
    }
  };

  return (
    <Modal
      title="Bulk Attendance Import"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button
          key="import"
          type="primary"
          icon={<UploadOutlined />}
          disabled={data.length === 0}
          loading={isLoading}
          onClick={handleImport}
        >
          Import {data.length > 0 ? `${data.length} Records` : ""}
        </Button>,
      ]}
    >
      <Dragger
        accept=".csv"
        beforeUpload={handleFileUpload}
        showUploadList={false}
        style={{ marginBottom: 24 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
        <p className="ant-upload-hint">Support for a single CSV file import. Column headers must match API fields.</p>
      </Dragger>

      {data.length > 0 && (
        <Table
          size="small"
          dataSource={data.slice(0, 5)}
          pagination={false}
          columns={Object.keys(data[0] || {}).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
          }))}
          footer={() => <Text type="secondary">Showing first 5 rows...</Text>}
        />
      )}
    </Modal>
  );
}
