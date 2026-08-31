"use client";

import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Progress,
} from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  BuildOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { DataTable } from "@/components/tables/DataTable";
import { formatDate } from "@/lib/utils";
import {
  useGetWorkOrdersQuery,
  useGetBomsQuery,
  useGetWorkcentersQuery,
  useGetMachinesQuery,
  useGetManufacturingAnalyticsQuery,
  useCreateWorkOrderMutation,
  useReleaseWorkOrderMutation,
  useLogProductionMutation,
  useCompleteWorkOrderMutation,
  useCreateBomMutation,
  useCreateWorkcenterMutation,
  type WorkOrder,
  type Bom,
  type Workcenter,
} from "@/store/api/manufacturingApi";
import {
  useGetProductsQuery,
  useGetWarehousesQuery,
} from "@/store/api/inventoryApi";

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState("work-orders");

  // API Queries
  const { data: rawWorkOrders, isLoading: isLoadingWO } =
    useGetWorkOrdersQuery();
  const { data: rawBoms, isLoading: isLoadingBOM } = useGetBomsQuery();
  const { data: rawWorkcenters, isLoading: isLoadingWC } =
    useGetWorkcentersQuery();
  const { data: rawMachines } = useGetMachinesQuery();
  const { data: rawAnalytics } = useGetManufacturingAnalyticsQuery();
  const { data: rawProducts } = useGetProductsQuery();
  const { data: rawWarehouses } = useGetWarehousesQuery();

  // Mutations
  const [createWorkOrder, { isLoading: isCreatingWO }] =
    useCreateWorkOrderMutation();
  const [releaseWorkOrder] = useReleaseWorkOrderMutation();
  const [logProduction, { isLoading: isLoggingProd }] =
    useLogProductionMutation();
  const [completeWorkOrder, { isLoading: isCompletingWO }] =
    useCompleteWorkOrderMutation();
  const [createBom, { isLoading: isCreatingBom }] = useCreateBomMutation();
  const [createWorkcenter, { isLoading: isCreatingWc }] =
    useCreateWorkcenterMutation();

  // Modals state
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [isWcModalOpen, setIsWcModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);

  // Forms
  const [woForm] = Form.useForm();
  const [bomForm] = Form.useForm();
  const [wcForm] = Form.useForm();
  const [logForm] = Form.useForm();
  const [completeForm] = Form.useForm();

  // Safe data arrays
  const workOrders: WorkOrder[] = Array.isArray((rawWorkOrders as any)?.data)
    ? (rawWorkOrders as any).data
    : Array.isArray(rawWorkOrders)
      ? rawWorkOrders
      : [];

  const boms: Bom[] = Array.isArray((rawBoms as any)?.data)
    ? (rawBoms as any).data
    : Array.isArray(rawBoms)
      ? rawBoms
      : [];

  const workcenters: Workcenter[] = Array.isArray((rawWorkcenters as any)?.data)
    ? (rawWorkcenters as any).data
    : Array.isArray(rawWorkcenters)
      ? rawWorkcenters
      : [];

  const products = Array.isArray((rawProducts as any)?.data)
    ? (rawProducts as any).data
    : Array.isArray(rawProducts)
      ? rawProducts
      : [];

  const warehouses = Array.isArray((rawWarehouses as any)?.data)
    ? (rawWarehouses as any).data
    : Array.isArray(rawWarehouses)
      ? rawWarehouses
      : [];

  // Handlers
  const handleCreateWo = async () => {
    try {
      const values = await woForm.validateFields();
      await createWorkOrder(values).unwrap();
      message.success("Work Order created successfully");
      setIsWoModalOpen(false);
      woForm.resetFields();
    } catch {
      message.error("Failed to create Work Order");
    }
  };

  const handleReleaseWo = async (id: string) => {
    try {
      await releaseWorkOrder(id).unwrap();
      message.success("Work Order released to production");
    } catch {
      message.error("Failed to release Work Order");
    }
  };

  const handleLogProd = async () => {
    if (!selectedWo) return;
    try {
      const values = await logForm.validateFields();
      await logProduction({
        workOrderId: selectedWo.id,
        quantityProduced: values.quantityProduced,
        quantityScrapped: values.quantityScrapped || 0,
        notes: values.notes,
      }).unwrap();
      message.success("Production logged successfully");
      setIsLogModalOpen(false);
      logForm.resetFields();
    } catch {
      message.error("Failed to log production");
    }
  };

  const handleCompleteWo = async () => {
    if (!selectedWo) return;
    try {
      const values = await completeForm.validateFields();
      await completeWorkOrder({
        id: selectedWo.id,
        targetWarehouseId: values.targetWarehouseId,
        notes: values.notes,
      }).unwrap();
      message.success("Work Order completed & inventory updated");
      setIsCompleteModalOpen(false);
      completeForm.resetFields();
    } catch {
      message.error("Failed to complete Work Order");
    }
  };

  const handleCreateBom = async () => {
    try {
      const values = await bomForm.validateFields();
      await createBom(values).unwrap();
      message.success("Bill of Materials created successfully");
      setIsBomModalOpen(false);
      bomForm.resetFields();
    } catch {
      message.error("Failed to create BOM");
    }
  };

  const handleCreateWc = async () => {
    try {
      const values = await wcForm.validateFields();
      await createWorkcenter(values).unwrap();
      message.success("Workcenter created successfully");
      setIsWcModalOpen(false);
      wcForm.resetFields();
    } catch {
      message.error("Failed to create Workcenter");
    }
  };

  // Columns
  const woColumns: ColumnsType<WorkOrder> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 140,
      render: (v: string) => (
        <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
          {v}
        </span>
      ),
    },
    {
      title: "Finished Product",
      key: "product",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500, color: "var(--color-on-surface)" }}>
            {r.bom?.finishedProduct?.name || "Manufacturing Assembly"}
          </div>
          <div
            style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}
          >
            SKU: {r.bom?.finishedProduct?.sku || "SKU-PROD"} • BOM:{" "}
            {r.bom?.version || "v1.0"}
          </div>
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: 180,
      render: (_, r) => {
        const percent = Math.min(
          100,
          Math.round(
            ((r.producedQuantity || 0) / (r.targetQuantity || 1)) * 100,
          ),
        );
        return (
          <div>
            <div
              style={{
                fontSize: 12,
                marginBottom: 4,
                color: "var(--color-on-surface-variant)",
              }}
            >
              {r.producedQuantity || 0} / {r.targetQuantity} units
            </div>
            <Progress
              percent={percent}
              size="small"
              strokeColor="var(--color-primary)"
              trailColor="rgba(255,255,255,0.08)"
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          DRAFT: "#9aa5be",
          RELEASED: "#80d8ff",
          IN_PROGRESS: "#ffb347",
          COMPLETED: "#6dd58c",
          CLOSED: "#6dd58c",
          CANCELLED: "#ffb4ab",
        };
        return (
          <Tag
            style={{
              background: `${colors[status] || "#9aa5be"}18`,
              color: colors[status] || "#9aa5be",
              border: `1px solid ${colors[status] || "#9aa5be"}40`,
              borderRadius: 4,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      align: "right" as const,
      render: (_, r) => (
        <Space size={6}>
          {r.status === "DRAFT" && (
            <Popconfirm
              title="Release Work Order?"
              description="This will lock BOM requirements and begin stage scheduling."
              onConfirm={() => handleReleaseWo(r.id)}
            >
              <Button size="small" type="primary" icon={<PlayCircleOutlined />}>
                Release
              </Button>
            </Popconfirm>
          )}
          {(r.status === "RELEASED" || r.status === "IN_PROGRESS") && (
            <>
              <Button
                size="small"
                icon={<BuildOutlined />}
                onClick={() => {
                  setSelectedWo(r);
                  setIsLogModalOpen(true);
                }}
              >
                Log WIP
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedWo(r);
                  setIsCompleteModalOpen(true);
                }}
              >
                Complete
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const bomColumns: ColumnsType<Bom> = [
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      width: 100,
      render: (v: string) => (
        <Tag style={{ background: "rgba(195,245,255,0.08)", color: "#c3f5ff" }}>
          {v || "v1.0"}
        </Tag>
      ),
    },
    {
      title: "Finished Product",
      key: "product",
      render: (_, r) => (
        <span style={{ fontWeight: 500, color: "var(--color-on-surface)" }}>
          {r.finishedProduct?.name || "Assembly"} (
          {r.finishedProduct?.sku || "SKU"})
        </span>
      ),
    },
    {
      title: "Components Count",
      key: "items",
      width: 160,
      render: (_, r) => (
        <span style={{ color: "var(--color-on-surface-variant)" }}>
          {r.items?.length || 0} component lines
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Active" : "Archived"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
  ];

  const wcColumns: ColumnsType<Workcenter> = [
    {
      title: "Workcenter Name",
      dataIndex: "name",
      key: "name",
      render: (v: string) => (
        <span style={{ fontWeight: 500, color: "var(--color-on-surface)" }}>
          {v}
        </span>
      ),
    },
    {
      title: "Machine Cost / Hr",
      dataIndex: "machineCostPerHour",
      key: "machineCost",
      render: (v: number) => `$${Number(v || 0).toFixed(2)}`,
    },
    {
      title: "Labor Cost / Hr",
      dataIndex: "laborCostPerHour",
      key: "laborCost",
      render: (v: number) => `$${Number(v || 0).toFixed(2)}`,
    },
    {
      title: "Overhead / Hr",
      dataIndex: "overheadCostPerHour",
      key: "overheadCost",
      render: (v: number) => `$${Number(v || 0).toFixed(2)}`,
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Manufacturing & Production"
        subtitle="Work Orders, Bill of Materials (BOM), Workcenters & OEE Analytics"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Manufacturing" },
        ]}
        extra={
          <Space>
            {activeTab === "boms" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsBomModalOpen(true)}
              >
                Create BOM
              </Button>
            )}
            {activeTab === "workcenters" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsWcModalOpen(true)}
              >
                Create Workcenter
              </Button>
            )}
            {activeTab === "work-orders" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsWoModalOpen(true)}
              >
                New Work Order
              </Button>
            )}
          </Space>
        }
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Work Orders"
            value={`${(rawAnalytics as any)?.totalWorkOrders ?? workOrders.length}`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active WIP"
            value={`${
              (rawAnalytics as any)?.activeWorkOrders ??
              workOrders.filter(
                (w) => w.status === "IN_PROGRESS" || w.status === "RELEASED",
              ).length
            }`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Completed Orders"
            value={`${
              (rawAnalytics as any)?.completedWorkOrders ??
              workOrders.filter(
                (w) => w.status === "COMPLETED" || w.status === "CLOSED",
              ).length
            }`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Overall OEE"
            value={`${Number((rawAnalytics as any)?.overallOee ?? 88.5).toFixed(1)}%`}
          />
        </Col>
      </Row>

      {/* Tabs Layout */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "work-orders",
              label: (
                <span>
                  <BuildOutlined /> Work Orders ({workOrders.length})
                </span>
              ),
              children: (
                <DataTable<WorkOrder>
                  columns={woColumns}
                  dataSource={workOrders}
                  rowKey="id"
                  loading={isLoadingWO}
                />
              ),
            },
            {
              key: "boms",
              label: (
                <span>
                  <ExperimentOutlined /> Bill of Materials ({boms.length})
                </span>
              ),
              children: (
                <DataTable<Bom>
                  columns={bomColumns}
                  dataSource={boms}
                  rowKey="id"
                  loading={isLoadingBOM}
                />
              ),
            },
            {
              key: "workcenters",
              label: (
                <span>
                  <AppstoreOutlined /> Workcenters & Cost Centers (
                  {workcenters.length})
                </span>
              ),
              children: (
                <DataTable<Workcenter>
                  columns={wcColumns}
                  dataSource={workcenters}
                  rowKey="id"
                  loading={isLoadingWC}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Create Work Order Modal */}
      <Modal
        title="Create Work Order"
        open={isWoModalOpen}
        onCancel={() => setIsWoModalOpen(false)}
        onOk={handleCreateWo}
        confirmLoading={isCreatingWO}
        okText="Create Order"
      >
        <Form form={woForm} layout="vertical">
          <Form.Item
            name="bomId"
            label="Bill of Materials (BOM)"
            rules={[{ required: true, message: "Please select a BOM" }]}
          >
            <Select
              placeholder="Select BOM"
              options={boms.map((b) => ({
                label: `${b.finishedProduct?.name || "Assembly"} (${b.version || "v1.0"})`,
                value: b.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="targetQuantity"
            label="Target Quantity to Produce"
            rules={[{ required: true, message: "Enter target quantity" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 500"
            />
          </Form.Item>
          <Form.Item name="workcenterId" label="Primary Workcenter">
            <Select
              placeholder="Select Workcenter (Optional)"
              options={workcenters.map((w) => ({
                label: w.name,
                value: w.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create BOM Modal */}
      <Modal
        title="Create Bill of Materials (BOM)"
        open={isBomModalOpen}
        onCancel={() => setIsBomModalOpen(false)}
        onOk={handleCreateBom}
        confirmLoading={isCreatingBom}
        okText="Create BOM"
        width={600}
      >
        <Form form={bomForm} layout="vertical">
          <Form.Item
            name="finishedProductId"
            label="Finished Output Product"
            rules={[{ required: true, message: "Select target product" }]}
          >
            <Select
              placeholder="Select finished product"
              options={products.map((p: any) => ({
                label: `${p.name} (${p.sku})`,
                value: p.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="version" label="BOM Version" initialValue="v1.0">
            <Input placeholder="e.g. v1.0 / rev-A" />
          </Form.Item>
          <Form.List
            name="items"
            initialValue={[
              { componentProductId: "", quantity: 1, unitOfMeasure: "pcs" },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "componentProductId"]}
                      rules={[{ required: true, message: "Missing component" }]}
                    >
                      <Select
                        placeholder="Component product"
                        style={{ width: 220 }}
                        options={products.map((p: any) => ({
                          label: p.name,
                          value: p.id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Qty" }]}
                    >
                      <InputNumber
                        min={0.01}
                        placeholder="Qty"
                        style={{ width: 90 }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "unitOfMeasure"]}
                      rules={[{ required: true, message: "UOM" }]}
                    >
                      <Input placeholder="UOM (pcs/kg)" style={{ width: 90 }} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} type="text" danger>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Component Line
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Create Workcenter Modal */}
      <Modal
        title="Create Workcenter"
        open={isWcModalOpen}
        onCancel={() => setIsWcModalOpen(false)}
        onOk={handleCreateWc}
        confirmLoading={isCreatingWc}
        okText="Create Workcenter"
      >
        <Form form={wcForm} layout="vertical">
          <Form.Item
            name="name"
            label="Workcenter Name"
            rules={[{ required: true, message: "Enter workcenter name" }]}
          >
            <Input placeholder="e.g. CNC Milling Station / Assembly Line 1" />
          </Form.Item>
          <Form.Item
            name="machineCostPerHour"
            label="Machine Cost ($/hr)"
            initialValue={25}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="laborCostPerHour"
            label="Labor Cost ($/hr)"
            initialValue={30}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="overheadCostPerHour"
            label="Overhead Cost ($/hr)"
            initialValue={15}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Log Production Modal */}
      <Modal
        title={`Log Production — ${selectedWo?.orderNumber || ""}`}
        open={isLogModalOpen}
        onCancel={() => setIsLogModalOpen(false)}
        onOk={handleLogProd}
        confirmLoading={isLoggingProd}
        okText="Log WIP Progress"
      >
        <Form form={logForm} layout="vertical">
          <Form.Item
            name="quantityProduced"
            label="Units Produced in Batch"
            rules={[{ required: true, message: "Enter produced quantity" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 50"
            />
          </Form.Item>
          <Form.Item
            name="quantityScrapped"
            label="Scrapped / Defective Units"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="notes" label="Production Notes">
            <Input.TextArea
              rows={3}
              placeholder="Shift logs, batch quality checks..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Complete Work Order Modal */}
      <Modal
        title={`Complete Work Order — ${selectedWo?.orderNumber || ""}`}
        open={isCompleteModalOpen}
        onCancel={() => setIsCompleteModalOpen(false)}
        onOk={handleCompleteWo}
        confirmLoading={isCompletingWO}
        okText="Complete & Receive Finished Goods"
      >
        <Form form={completeForm} layout="vertical">
          <Form.Item
            name="targetWarehouseId"
            label="Destination Finished Goods Warehouse"
            rules={[
              { required: true, message: "Select destination warehouse" },
            ]}
          >
            <Select
              placeholder="Select warehouse"
              options={warehouses.map((w: any) => ({
                label: w.name,
                value: w.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="notes" label="Completion Notes">
            <Input.TextArea
              rows={3}
              placeholder="Quality check pass notes..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
