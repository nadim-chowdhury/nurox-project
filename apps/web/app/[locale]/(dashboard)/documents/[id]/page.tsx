"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button, Card, Col, Row, Space, Typography, message, Modal, Spin } from "antd";
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import { useGetDownloadUrlQuery, useSignDocumentMutation } from "@/store/api/documentsApi";

const { Title, Text } = Typography;

export default function DocumentViewerPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [isSignModalVisible, setIsSignModalVisible] = useState(false);
  const [signerName, setSignerName] = useState("John Doe"); // Hardcoded for demo
  const sigPad = useRef<any>(null);

  const { data: downloadData, isLoading } = useGetDownloadUrlQuery({ id: documentId });
  const [signDocument, { isLoading: isSigning }] = useSignDocumentMutation();

  const handleSign = async () => {
    if (sigPad.current?.isEmpty()) {
      message.error("Please provide a signature first.");
      return;
    }

    const signatureBase64 = sigPad.current?.getTrimmedCanvas().toDataURL("image/png");

    try {
      await signDocument({
        id: documentId,
        signatureBase64,
        signerName,
        ipAddress: "192.168.1.1", // In production, grab from context
      }).unwrap();

      message.success("Document signed successfully!");
      setIsSignModalVisible(false);
    } catch (error) {
      message.error("Failed to sign document.");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <Space style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="text" 
          onClick={() => router.push("/documents")}
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Back to Documents
        </Button>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Document Preview</Title>}
            extra={
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => window.open(downloadData?.downloadUrl)}>
                  Download
                </Button>
                <Button type="primary" icon={<EditOutlined />} onClick={() => setIsSignModalVisible(true)}>
                  E-Sign
                </Button>
              </Space>
            }
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderColor: 'rgba(255,255,255,0.05)',
              minHeight: '80vh'
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>
            ) : downloadData?.downloadUrl ? (
              <iframe 
                src={downloadData.downloadUrl} 
                width="100%" 
                height="800px" 
                style={{ border: 'none', borderRadius: 8 }}
                title="Document Preview"
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', padding: 100 }}>
                Failed to load document preview.
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card 
            title="Properties" 
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderColor: 'rgba(255,255,255,0.05)' 
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ color: 'var(--color-on-surface-variant)' }}>Document ID</Text>
                <p style={{ color: 'var(--color-on-surface)' }}>{documentId}</p>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Electronic Signature"
        open={isSignModalVisible}
        onCancel={() => setIsSignModalVisible(false)}
        onOk={handleSign}
        confirmLoading={isSigning}
        okText="Sign & Apply"
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: 16 }}>Sign below as <strong>{signerName}</strong>:</p>
          <div style={{ 
            border: '2px dashed var(--color-outline)', 
            borderRadius: 8, 
            background: '#fff', // White background needed for clear signature capture
            padding: 4 
          }}>
            <SignatureCanvas 
              ref={sigPad}
              penColor="black"
              canvasProps={{
                width: 500, 
                height: 200, 
                className: 'sigCanvas'
              }} 
            />
          </div>
          <Button 
            type="link" 
            onClick={() => sigPad.current?.clear()}
            style={{ marginTop: 8, padding: 0 }}
          >
            Clear Signature
          </Button>
        </div>
      </Modal>
    </div>
  );
}
