"use client";

import React, { useState } from "react";
import { List, Card, Button, Rate, Space, Modal, Select, message, Typography, Tag, Row, Col } from "antd";
import { PlusOutlined, StarOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { 
  useGetSkillCatalogQuery, 
  useAddEmployeeSkillMutation,
  useGetEmployeeQuery
} from "@/store/api/hrApi";

const { Text } = Typography;

interface Props {
  employeeId: string;
}

export function SkillsTab({ employeeId }: Props) {
  const { data: emp, isLoading: isEmpLoading } = useGetEmployeeQuery(employeeId);
  const { data: catalog } = useGetSkillCatalogQuery();
  const [addSkill, { isLoading: isAdding }] = useAddEmployeeSkillMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [proficiency, setProficiency] = useState(3);

  const handleAdd = async () => {
    if (!selectedSkill) return;
    try {
      await addSkill({ id: employeeId, catalogId: selectedSkill, proficiency }).unwrap();
      message.success("Skill added to profile");
      setIsModalOpen(false);
      setSelectedSkill(null);
      setProficiency(3);
    } catch {
      message.error("Failed to add skill");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)}
        >
          Add Skill
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {emp?.skills?.map((s: any) => (
          <Col xs={24} sm={12} key={s.id}>
            <Card size="small" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <StarOutlined style={{ color: 'var(--color-warning)' }} />
                  <div>
                    <Text strong>{s.skillName}</Text>
                    <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
                      Last assessed: {new Date(s.lastAssessed).toLocaleDateString()}
                    </div>
                  </div>
                </Space>
                <Rate disabled defaultValue={s.proficiency} style={{ fontSize: 14 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Add Skill to Profile"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
        confirmLoading={isAdding}
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Select Skill</Text>
            <Select
              placeholder="Search skill catalog..."
              style={{ width: '100%' }}
              onChange={setSelectedSkill}
              options={catalog?.map(c => ({ label: `${c.name} (${c.category})`, value: c.id }))}
              showSearch
            />
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Proficiency Level</Text>
            <Rate value={proficiency} onChange={setProficiency} />
            <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
              {['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][proficiency - 1]}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
