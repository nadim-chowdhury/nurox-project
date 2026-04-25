"use client";

import React, { useState } from "react";
import { List, Card, Button, Modal, Typography, Tag, Space, message, Divider, Row, Col } from "antd";
import { BookOutlined, CheckCircleOutlined, EyeOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { 
  useGetHandbooksQuery,
  useAcknowledgeHandbookMutation
} from "@/store/api/hrApi";

const { Text, Title, Paragraph } = Typography;

interface Props {
  employeeId: string;
}

export function HandbookTab({ employeeId }: Props) {
  const { data: handbooks, isLoading } = useGetHandbooksQuery();
  const [acknowledge] = useAcknowledgeHandbookMutation();
  const [selectedHandbook, setSelectedHandbook] = useState<any>(null);

  const handleAcknowledge = async () => {
    try {
      await acknowledge({ id: employeeId, handbookId: selectedHandbook.id }).unwrap();
      message.success("Handbook acknowledged successfully");
      setSelectedHandbook(null);
    } catch {
      message.error("Failed to acknowledge handbook");
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={24}>
          <Title level={5} style={{ marginBottom: 16 }}>Company Handbooks & Policies</Title>
          <List
            loading={isLoading}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2 }}
            dataSource={handbooks?.filter(h => h.isActive)}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  size="small" 
                  title={item.title}
                  extra={<Tag color="blue">v{item.version}.0</Tag>}
                  style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}
                >
                  <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12 }}>
                    Official company policy regarding {item.title.toLowerCase()}. Please read and acknowledge.
                  </Paragraph>
                  <Button 
                    type="primary" 
                    block 
                    icon={<EyeOutlined />} 
                    onClick={() => setSelectedHandbook(item)}
                  >
                    View & Acknowledge
                  </Button>
                </Card>
              </List.Item>
            )}
          />
        </Col>
      </Row>

      <Modal
        title={selectedHandbook?.title}
        open={!!selectedHandbook}
        onCancel={() => setSelectedHandbook(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setSelectedHandbook(null)}>Close</Button>,
          selectedHandbook?.requireAcknowledgment && (
            <Button key="ack" type="primary" icon={<SafetyCertificateOutlined />} onClick={handleAcknowledge}>
              I have read and agree
            </Button>
          )
        ]}
      >
        <div 
          style={{ 
            maxHeight: 500, 
            overflowY: 'auto', 
            padding: 16, 
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            color: 'var(--color-on-surface)'
          }}
          dangerouslySetInnerHTML={{ __html: selectedHandbook?.content || "" }}
        />
        {selectedHandbook?.requireAcknowledgment && (
          <div style={{ marginTop: 24, padding: 12, background: 'rgba(195, 245, 255, 0.05)', borderRadius: 4, borderLeft: '4px solid var(--color-primary)' }}>
            <Text strong>Acknowledgment Required</Text>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              By clicking "I have read and agree", you confirm that you have read and understood the terms of this handbook.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
