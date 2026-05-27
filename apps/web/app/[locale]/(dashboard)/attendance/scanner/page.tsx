"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Card, Button, Typography, Result } from "antd";
import { QrCode, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function QRScannerPage() {
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const [scanned, setScanned] = useState(false);

  // In a real app, we would process the image frame using a QR decoding library (like jsQR)
  // For this mock, we will just simulate a scan via a button
  const simulateScan = useCallback(() => {
    setScanned(true);
    // Here we would call the backend to record attendance
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Button
          type="text"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back
        </Button>

        {scanned ? (
          <Card className="text-center">
            <Result
              status="success"
              title="Successfully Checked In"
              subTitle="Your attendance for today has been recorded at 09:00 AM."
              extra={[
                <Button
                  type="primary"
                  key="console"
                  onClick={() => router.push("/en/attendance")}
                >
                  Go to Attendance
                </Button>,
              ]}
            />
          </Card>
        ) : (
          <Card
            title={
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span>Scan Office QR</span>
              </div>
            }
          >
            <div className="relative overflow-hidden rounded-lg bg-black aspect-[3/4] mb-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="object-cover w-full h-full"
              />
              {/* Scanner overlay effect */}
              <div className="absolute inset-0 pointer-events-none border-2 border-primary/50 m-8 rounded-xl flex items-center justify-center">
                <div className="w-full h-[2px] bg-primary animate-scan shadow-[0_0_8px_rgba(24,144,255,0.8)]"></div>
              </div>
            </div>
            <div className="text-center space-y-4">
              <Text type="secondary">
                Point your camera at the Nurox QR code located at the office
                entrance to check in.
              </Text>
              <Button type="primary" block size="large" onClick={simulateScan}>
                [Mock] Trigger Scan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
