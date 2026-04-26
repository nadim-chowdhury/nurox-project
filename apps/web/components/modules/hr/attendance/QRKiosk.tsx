"use client";

import React, { useState } from "react";
import { Modal, Typography, Space, message, Result, Spin } from "antd";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrcodeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useCheckInMutation } from "@/store/api/attendanceApi";

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function QRKiosk({ open, onClose }: Props) {
  const [checkIn, { isLoading }] = useCheckInMutation();
  const [success, setSuccess] = useState<any>(null);

  const handleScan = async (result: string) => {
    if (!result || isLoading) return;
    
    try {
      // In a real implementation, the QR value should contain employeeId and token
      // For the prototype, we'll assume it's just the token
      const res = await checkIn({ employeeId: "some-id", token: result, method: "QR" }).unwrap();
      setSuccess(res);
      message.success("Attendance recorded!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      message.error(err.data?.message || "Invalid or expired QR code");
    }
  };

  return (
    <Modal
      title={<span><QrcodeOutlined /> Attendance Kiosk</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        {success ? (
          <Result
            status="success"
            title="Success!"
            subTitle={`Attendance recorded for ${success.employee?.firstName || 'Employee'}`}
            extra={<Text type="secondary">Ready for next scan...</Text>}
          />
        ) : (
          <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
            <Title level={4}>Scan your check-in QR</Title>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '4px solid var(--color-primary)' }}>
              <Scanner
                onScan={(detectedCodes) => {
                  const code = detectedCodes?.[0];
                  if (code?.rawValue) {
                    handleScan(code.rawValue);
                  }
                }}
                onError={(err) => console.error(err)}
              />
            </div>
            {isLoading && <div style={{ marginTop: 16 }}><Spin tip="Processing..." /></div>}
            <div style={{ marginTop: 24 }}>
              <Text type="secondary">Open the Nurox app on your mobile and show the Check-In QR code to this camera.</Text>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
