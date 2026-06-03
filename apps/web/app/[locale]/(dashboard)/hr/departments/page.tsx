"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Tree,
  Space,
  Tooltip,
  message,
  Modal,
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
import {
  createDepartmentSchema,
  type DepartmentDto,
  type CreateDepartmentDto,
} from "@repo/shared-schemas";
import { OrgChart } from "@/components/modules/hr/OrgChart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RhfInput } from "@/components/common/forms/RhfInput";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";

export default function DepartmentsPage() {
  const { data: departments, isLoading, refetch } = useGetDepartmentsQuery();
  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);

  const { control, handleSubmit, reset, setValue } =
    useForm<CreateDepartmentDto>({
      resolver: zodResolver(createDepartmentSchema),
      defaultValues: {
        name: "",
        code: "",
        description: "",
        costCenter: "",
        parentId: null,
      },
    });

  const handleAdd = (pId: string | null = null) => {
    setEditingDept(null);
    reset({
      name: "",
      code: "",
      description: "",
      costCenter: "",
      parentId: pId,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (dept: DepartmentDto) => {
    setEditingDept(dept);
    reset({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      costCenter: dept.costCenter || "",
      parentId: dept.parentId || null,
    });
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

  const onSubmit = async (values: CreateDepartmentDto) => {
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

  // ... (rest of methods unchanged)
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
        onOk={handleSubmit(onSubmit)}
        destroyOnClose
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RhfSelect
            name="parentId"
            control={control}
            label="Parent Department"
            placeholder="Select parent (optional)"
            options={(departments || []).map((d) => ({
              label: d.name,
              value: d.id,
            }))}
            allowClear
          />
          <Row gutter={16}>
            <Col span={16}>
              <RhfInput
                name="name"
                control={control}
                label="Department Name"
                placeholder="e.g. Engineering"
              />
            </Col>
            <Col span={8}>
              <RhfInput
                name="code"
                control={control}
                label="Code"
                placeholder="e.g. ENG"
              />
            </Col>
          </Row>
          <RhfInput
            name="costCenter"
            control={control}
            label="Cost Center"
            placeholder="e.g. CC-101"
          />
          <RhfTextArea
            name="description"
            control={control}
            label="Description"
            rows={3}
          />
        </div>
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
