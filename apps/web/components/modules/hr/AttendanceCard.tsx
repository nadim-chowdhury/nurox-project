"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Space, Tag, message, QRCode, Modal, Spin } from "antd";
import { CheckCircleOutlined, LogoutOutlined, QrcodeOutlined, environmentOutlined } from "@ant-design/icons";
import { useCheckInMutation, useCheckOutMutation, useLazyGetCheckInQrQuery } from "@/store/api/attendanceApi";
import { useAppSelector } from "@/hooks/useRedux";

const { Title, Text } = Typography;

export const AttendanceCard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();
  const [triggerQr, { data: qrData, isLoading: isQrLoading }] = useLazyGetCheckInQrQuery();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGeoCheckIn = () => {
    if (!navigator.geolocation) {
      return message.error("Geolocation is not supported by your browser");
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        await checkIn({
          employeeId: user!.id,
          method: "GEO_FENCED",
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }).unwrap();
        message.success("Checked in successfully!");
      } catch (err: any) {
        message.error(err.data?.message || "Check-in failed");
      }
    });
  };

  const handleCheckOut = async () => {
    try {
      await checkOut({
        employeeId: user!.id,
        method: "MANUAL",
      }).unwrap();
      message.success("Checked out successfully!");
    } catch (err: any) {
      message.error(err.data?.message || "Check-out failed");
    }
  };

  const showQr = () => {
    triggerQr(user!.id);
    setIsQrModalOpen(true);
  };

  return (
    <Card className="shadow-md max-w-md">
      <div className="text-center space-y-4">
        <Title level={4}>{currentTime.toLocaleTimeString()}</Title>
        <Text type="secondary">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        
        <Divider />

        <Space direction="vertical" className="w-full" size="middle">
          <Button 
            type="primary" 
            size="large" 
            block 
            icon={<CheckCircleOutlined />} 
            loading={isCheckingIn}
            onClick={handleGeoCheckIn}
          >
            Check In (Geo)
          </Button>
          
          <div className="flex gap-2">
            <Button 
              block 
              icon={<QrcodeOutlined />} 
              onClick={showQr}
            >
              My QR
            </Button>
            <Button 
              danger 
              block 
              icon={<LogoutOutlined />} 
              loading={isCheckingOut}
              onClick={handleCheckOut}
            >
              Check Out
            </Button>
          </div>
        </Space>
      </div>

      <Modal
        title="Check-in QR Code"
        open={isQrModalOpen}
        onCancel={() => setIsQrModalOpen(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col items-center p-8 gap-4">
          {isQrLoading ? <Spin /> : (
            <>
              <QRCode value={qrData?.token || ""} size={250} />
              <Text type="secondary">Scan this at the entrance station. Valid for 1 minute.</Text>
            </>
          )}
        </div>
      </Modal>
    </Card>
  );
};

// Helper for divider
const Divider = () => <div className="border-t border-gray-100 my-4" />;
