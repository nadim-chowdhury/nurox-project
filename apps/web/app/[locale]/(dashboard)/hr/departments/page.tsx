"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Tree,
  Space,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Select,
  Tabs,
  Row,
  Col,
  type TreeDataNode,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/store/api/hrApi";
import { confirmModal } from "@/components/common/ConfirmModal";
import type { DepartmentDto } from "@repo/shared-schemas";
import { OrgChart } from "@/components/modules/hr/OrgChart";

export default function DepartmentsPage() {
  const { data: departments, isLoading, refetch } = useGetDepartmentsQuery();
  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleAdd = (pId: string | null = null) => {
    setEditingDept(null);
    setParentId(pId);
    form.resetFields();
    form.setFieldsValue({ parentId: pId });
    setIsModalOpen(true);
  };

  const handleEdit = (dept: DepartmentDto) => {
    setEditingDept(dept);
    setParentId(dept.parentId || null);
    form.setFieldsValue(dept);
    setIsModalOpen(true);
  };

  const handleDelete = (dept: DepartmentDto) => {
    confirmModal({
      title: `Delete Department: ${dept.name}?`,
      content:
        "This will remove the department and may affect linked employees. This action cannot be undone.",
      onOk: async () => {
        try {
          await deleteDept(dept.id!).unwrap();
          message.success("Department deleted");
          refetch();
        } catch {
          message.error("Failed to delete department");
        }
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
      if (editingDept) {
        await updateDept({ id: editingDept.id!, data: values }).unwrap();
        message.success("Department updated");
      } else {
        await createDept(values).unwrap();
        message.success("Department created");
      }
      setIsModalOpen(false);
      refetch();
    } catch {
      message.error("Failed to save department");
    }
  };

  // Convert flat list/trees from API to Ant Design Tree format
  const renderTreeNodes = (data: any[]): TreeDataNode[] =>
    data.map((item) => ({
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            minWidth: 400,
          }}
        >
          <span>
            <span style={{ fontWeight: 500 }}>{item.name}</span>
            <span
              style={{
                color: "var(--color-on-surface-variant)",
                marginLeft: 8,
                fontSize: 12,
              }}
            >
              ({item.code})
            </span>
            {item.costCenter && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  background: "var(--ghost-bg)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {item.costCenter}
              </span>
            )}
          </span>
          <Space size={4} className="tree-actions">
            <Tooltip title="Add Sub-department">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(item.id);
                }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item);
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
              />
            </Tooltip>
          </Space>
        </div>
      ),
      key: item.id,
      children: item.children ? renderTreeNodes(item.children) : [],
    }));

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Departments"
        subtitle="Manage organizational structure and cost centers"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Departments" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd()}
          >
            Add Root Department
          </Button>
        }
      />

      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: "list",
            label: (
              <span>
                <ApartmentOutlined /> Hierarchical List
              </span>
            ),
            children: (
              <Card
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                }}
              >
                {isLoading ? (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    Loading...
                  </div>
                ) : (
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={true}
                    switcherIcon={<ApartmentOutlined />}
                    treeData={renderTreeNodes(departments || [])}
                    selectable={false}
                    defaultExpandAll
                    style={{
                      background: "transparent",
                      color: "var(--color-on-surface)",
                    }}
                  />
                )}
              </Card>
            ),
          },
          {
            key: "chart",
            label: (
              <span>
                <PartitionOutlined /> Org Chart
              </span>
            ),
            children: <OrgChart data={departments || []} loading={isLoading} />,
          },
        ]}
      />

      <Modal
        title={editingDept ? "Edit Department" : "Add Department"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ parentId }}
        >
          <Form.Item name="parentId" label="Parent Department">
            <Select
              allowClear
              placeholder="Select parent (optional)"
              options={(departments || []).map((d) => ({
                label: d.name,
                value: d.id,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Department Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. Engineering" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="code"
                label="Code"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. ENG" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="costCenter" label="Cost Center">
            <Input placeholder="e.g. CC-101" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .ant-tree-node-content-wrapper {
          width: 100%;
        }
        .tree-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .ant-tree-treenode:hover .tree-actions {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
