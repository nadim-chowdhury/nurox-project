"use client";

import React, { useState } from "react";
import { Modal, Upload, Button, Table, Alert, message, Space } from "antd";
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { z } from "zod";
import { useBulkCreateUsersMutation } from "@/store/api/usersApi";

// Simple validation schema for CSV rows
const csvRowSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  role: z.string().optional().default("EMPLOYEE"),
});

interface BulkUserImportProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUserImport({ open, onClose, onSuccess }: BulkUserImportProps) {
  const [data, setData] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [bulkCreate, { isLoading }] = useBulkCreateUsersMutation();

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validatedData: any[] = [];
        const validationErrors: any[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            const parsed = csvRowSchema.parse(row);
            validatedData.push({ ...parsed, status: 'ACTIVE' });
          } catch (err: any) {
            validationErrors.push({
              row: index + 2, // +1 for header, +1 for 1-based index
              email: row.email || 'N/A',
              error: err.errors?.[0]?.message || "Invalid row data",
            });
          }
        });

        setData(validatedData);
        setErrors(validationErrors);
        
        if (validationErrors.length > 0) {
          message.warning(`Found ${validationErrors.length} errors in CSV`);
        } else {
          message.success(`Parsed ${validatedData.length} rows successfully`);
        }
      },
    });
    return false; // Prevent auto-upload
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    try {
      await bulkCreate(data).unwrap();
      message.success(`Successfully imported ${data.length} users`);
      onSuccess();
      onClose();
      setData([]);
      setErrors([]);
    } catch {
      message.error("Failed to import users");
    }
  };

  const columns = [
    { title: "Row", dataIndex: "row", width: 80 },
    { title: "Email", dataIndex: "email", width: 200 },
    { title: "Error", dataIndex: "error", render: (text: string) => <span style={{ color: 'var(--color-error)' }}>{text}</span> },
  ];

  return (
    <Modal
      title="Bulk Import Users"
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button 
          key="import" 
          type="primary" 
          disabled={data.length === 0} 
          loading={isLoading}
          onClick={handleImport}
        >
          Import {data.length} Users
        </Button>
      ]}
    >
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
          Upload a CSV file with columns: <b>firstName, lastName, email, role</b>. 
          The role is optional (defaults to EMPLOYEE).
        </p>
        <Upload 
          accept=".csv" 
          beforeUpload={handleFileUpload} 
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Select CSV File</Button>
        </Upload>
      </div>

      {data.length > 0 && errors.length === 0 && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message={`${data.length} users ready for import.`}
          style={{ marginBottom: 24 }}
        />
      )}

      {errors.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Alert
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            message={`Found ${errors.length} errors. Please fix these rows in your CSV and re-upload.`}
            style={{ marginBottom: 16 }}
          />
          <Table 
            dataSource={errors} 
            columns={columns} 
            size="small" 
            pagination={{ pageSize: 5 }}
            rowKey="row"
          />
        </div>
      )}
    </Modal>
  );
}
