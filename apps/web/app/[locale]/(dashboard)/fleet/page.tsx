"use client";

import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Modal,
  Tag,
  Space,
  Input,
  Select,
  InputNumber,
  DatePicker,
  message,
  Typography,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  CompassOutlined,
  FireOutlined,
  SendOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useGetFuelLogsQuery,
  useCreateFuelLogMutation,
  useGetTripLogsQuery,
  useCreateTripLogMutation,
  useOptimizeRouteMutation,
  type Vehicle,
  type FuelLog,
  type TripLog,
} from "@/store/api/fleetApi";

const { Text, Paragraph } = Typography;

export default function FleetManagementPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("vehicles");
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [tripModalVisible, setTripModalVisible] = useState(false);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    fuelType: "DIESEL" as "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID",
    capacityKg: 1000,
  });

  const [fuelForm, setFuelForm] = useState({
    vehicleId: "",
    odometer: 0,
    fuelQuantity: 50,
    cost: 100,
  });

  const [tripForm, setTripForm] = useState({
    vehicleId: "",
    driverId: "d3b07384-d113-4c4e-9c8e-cf00257e8412",
    origin: "",
    destination: "",
    distanceKm: 25,
  });

  // Route optimizer state
  const [stopsText, setStopsText] = useState(
    "Warehouse A, Distribution Hub B, Retail Store C, Port Dock D",
  );
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);

  // Queries
  const { data: vehiclesData, isLoading: isLoadingVehicles } =
    useGetVehiclesQuery();
  const { data: fuelLogsData, isLoading: isLoadingFuel } =
    useGetFuelLogsQuery();
  const { data: tripLogsData, isLoading: isLoadingTrips } =
    useGetTripLogsQuery();

  // Mutations
  const [createVehicle, { isLoading: isCreatingVehicle }] =
    useCreateVehicleMutation();
  const [createFuelLog, { isLoading: isLoggingFuel }] =
    useCreateFuelLogMutation();
  const [createTripLog, { isLoading: isLoggingTrip }] =
    useCreateTripLogMutation();
  const [optimizeRoute, { isLoading: isOptimizing }] =
    useOptimizeRouteMutation();

  const vehicles: Vehicle[] = Array.isArray(vehiclesData?.data)
    ? vehiclesData.data
    : Array.isArray(vehiclesData)
      ? (vehiclesData as any)
      : [];

  const fuelLogs: FuelLog[] = Array.isArray(fuelLogsData?.data)
    ? fuelLogsData.data
    : Array.isArray(fuelLogsData)
      ? (fuelLogsData as any)
      : [];

  const tripLogs: TripLog[] = Array.isArray(tripLogsData?.data)
    ? tripLogsData.data
    : Array.isArray(tripLogsData)
      ? (tripLogsData as any)
      : [];

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateVehicle = async () => {
    if (
      !vehicleForm.registrationNumber ||
      !vehicleForm.make ||
      !vehicleForm.model
    ) {
      message.error("Please fill in all required vehicle details");
      return;
    }
    try {
      await createVehicle(vehicleForm).unwrap();
      message.success("Vehicle registered successfully");
      setVehicleModalVisible(false);
      setVehicleForm({
        registrationNumber: "",
        make: "",
        model: "",
        fuelType: "DIESEL",
        capacityKg: 1000,
      });
    } catch {
      message.error("Failed to register vehicle");
    }
  };

  const handleLogFuel = async () => {
    if (
      !fuelForm.vehicleId ||
      fuelForm.odometer <= 0 ||
      fuelForm.fuelQuantity <= 0
    ) {
      message.error("Please complete all fuel log details");
      return;
    }
    try {
      await createFuelLog(fuelForm).unwrap();
      message.success("Fuel log recorded");
      setFuelModalVisible(false);
    } catch {
      message.error("Failed to record fuel log");
    }
  };

  const handleLogTrip = async () => {
    if (!tripForm.vehicleId || !tripForm.origin || !tripForm.destination) {
      message.error("Please complete all trip details");
      return;
    }
    try {
      await createTripLog(tripForm).unwrap();
      message.success("Trip dispatched successfully");
      setTripModalVisible(false);
    } catch {
      message.error("Failed to dispatch trip");
    }
  };

  const handleOptimizeRoute = async () => {
    const stops = stopsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (stops.length < 2) {
      message.warning("Please enter at least 2 waypoint stops");
      return;
    }
    try {
      const res = await optimizeRoute({ stops }).unwrap();
      setOptimizedRoute({ stops, ...res });
      message.success("AI Route optimization completed!");
    } catch {
      message.error("Failed to optimize route");
    }
  };

  const vehicleColumns: ColumnsType<Vehicle> = [
    {
      title: "Vehicle Reg #",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      render: (v) => (
        <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
          {v}
        </span>
      ),
    },
    {
      title: "Make & Model",
      key: "makeModel",
      render: (_, r) => `${r.make} ${r.model}`,
    },
    {
      title: "Fuel Type",
      dataIndex: "fuelType",
      key: "fuelType",
      render: (type) => {
        const color =
          type === "ELECTRIC"
            ? "green"
            : type === "HYBRID"
              ? "cyan"
              : type === "DIESEL"
                ? "orange"
                : "blue";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Payload Capacity",
      dataIndex: "capacityKg",
      key: "capacityKg",
      render: (v) => `${v.toLocaleString()} kg`,
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="green">Active</Tag>,
    },
    {
      title: "Registered",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
  ];

  const fuelColumns: ColumnsType<FuelLog> = [
    {
      title: "Vehicle",
      key: "vehicle",
      render: (_, r) =>
        r.vehicle?.registrationNumber || r.vehicleId.slice(0, 8),
    },
    {
      title: "Odometer",
      dataIndex: "odometer",
      key: "odometer",
      render: (v) => `${v.toLocaleString()} km`,
    },
    {
      title: "Fuel Quantity",
      dataIndex: "fuelQuantity",
      key: "fuelQuantity",
      render: (v) => `${v} L`,
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      render: (v) => formatCurrency(v),
    },
    {
      title: "Logged At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
  ];

  const tripColumns: ColumnsType<TripLog> = [
    {
      title: "Vehicle",
      key: "vehicle",
      render: (_, r) =>
        r.vehicle?.registrationNumber || r.vehicleId.slice(0, 8),
    },
    {
      title: "Origin",
      dataIndex: "origin",
      key: "origin",
    },
    {
      title: "Destination",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "Distance",
      dataIndex: "distanceKm",
      key: "distanceKm",
      render: (v) => `${v} km`,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Logistics & Fleet"
        subtitle="Vehicle registry, trip dispatch, fuel monitoring, and AI route planning"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Logistics & Fleet" },
        ]}
        extra={
          <Space>
            <Button
              icon={<FireOutlined />}
              onClick={() => {
                if (vehicles.length > 0 && vehicles[0])
                  setFuelForm((prev) => ({
                    ...prev,
                    vehicleId: vehicles[0]?.id || "",
                  }));
                setFuelModalVisible(true);
              }}
            >
              Log Fuel
            </Button>
            <Button
              icon={<SendOutlined />}
              onClick={() => {
                if (vehicles.length > 0 && vehicles[0])
                  setTripForm((prev) => ({
                    ...prev,
                    vehicleId: vehicles[0]?.id || "",
                  }));
                setTripModalVisible(true);
              }}
            >
              Dispatch Trip
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setVehicleModalVisible(true)}
            >
              Add Vehicle
            </Button>
          </Space>
        }
      />

      {/* KPI Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Active Fleet" value={`${vehicles.length || 0}`} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Trips Logged"
            value={`${tripLogs.length || 0}`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Fuel Spend"
            value={formatCurrency(
              fuelLogs.reduce((acc, curr) => acc + Number(curr.cost || 0), 0),
            )}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Distance Covered"
            value={`${tripLogs.reduce((acc, curr) => acc + Number(curr.distanceKm || 0), 0).toLocaleString()} km`}
          />
        </Col>
      </Row>

      {/* Tabs */}
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
              key: "vehicles",
              label: (
                <span>
                  <CarOutlined style={{ marginRight: 8 }} />
                  Vehicles ({vehicles.length})
                </span>
              ),
              children: (
                <>
                  <TableToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search vehicles by reg #, make, model..."
                  />
                  <DataTable
                    columns={vehicleColumns}
                    dataSource={filteredVehicles}
                    rowKey="id"
                    loading={isLoadingVehicles}
                  />
                </>
              ),
            },
            {
              key: "trips",
              label: (
                <span>
                  <CompassOutlined style={{ marginRight: 8 }} />
                  Trip Logs ({tripLogs.length})
                </span>
              ),
              children: (
                <DataTable
                  columns={tripColumns}
                  dataSource={tripLogs}
                  rowKey="id"
                  loading={isLoadingTrips}
                />
              ),
            },
            {
              key: "fuel",
              label: (
                <span>
                  <FireOutlined style={{ marginRight: 8 }} />
                  Fuel Logs ({fuelLogs.length})
                </span>
              ),
              children: (
                <DataTable
                  columns={fuelColumns}
                  dataSource={fuelLogs}
                  rowKey="id"
                  loading={isLoadingFuel}
                />
              ),
            },
            {
              key: "route_planner",
              label: (
                <span>
                  <CompassOutlined style={{ marginRight: 8 }} />
                  AI Route Optimizer
                </span>
              ),
              children: (
                <div style={{ padding: "16px 0" }}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <Card
                        title="Delivery Waypoints"
                        style={{
                          background: "var(--color-surface-container)",
                          border: "1px solid var(--ghost-border)",
                        }}
                      >
                        <Paragraph
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          Enter comma-separated delivery addresses or warehouse
                          waypoints to calculate the most fuel-efficient
                          dispatch path:
                        </Paragraph>
                        <Input.TextArea
                          rows={4}
                          value={stopsText}
                          onChange={(e) => setStopsText(e.target.value)}
                          placeholder="e.g. Central Depot, Store 101, Customer Dock 4..."
                          style={{ marginBottom: 16 }}
                        />
                        <Button
                          type="primary"
                          icon={<CompassOutlined />}
                          loading={isOptimizing}
                          onClick={handleOptimizeRoute}
                        >
                          Calculate Optimal Route
                        </Button>
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card
                        title="Optimized Dispatch Plan"
                        style={{
                          background: "var(--color-surface-container)",
                          border: "1px solid var(--ghost-border)",
                        }}
                      >
                        {optimizedRoute ? (
                          <div>
                            <Space
                              direction="vertical"
                              size="middle"
                              style={{ width: "100%" }}
                            >
                              <div>
                                <Text strong>Estimated Distance: </Text>
                                <Tag color="blue">
                                  {optimizedRoute.estimatedTotalDistanceKm.toFixed(
                                    1,
                                  )}{" "}
                                  km
                                </Tag>
                              </div>
                              <div>
                                <Text strong>Estimated Transit Time: </Text>
                                <Tag color="green">
                                  {optimizedRoute.estimatedTotalMinutes} mins
                                </Tag>
                              </div>
                              <Text strong>Optimized Waypoint Sequence:</Text>
                              <ol style={{ paddingLeft: 20 }}>
                                {optimizedRoute.optimizedOrder.map(
                                  (idx: number, step: number) => (
                                    <li key={step} style={{ marginBottom: 4 }}>
                                      <Text
                                        style={{
                                          color: "var(--color-primary)",
                                        }}
                                      >
                                        Stop {step + 1}:{" "}
                                      </Text>
                                      <Text>{optimizedRoute.stops[idx]}</Text>
                                    </li>
                                  ),
                                )}
                              </ol>
                            </Space>
                          </div>
                        ) : (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "40px 0",
                              color: "var(--color-on-surface-variant)",
                            }}
                          >
                            Enter waypoints on the left and click calculate to
                            generate an optimal dispatch route.
                          </div>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Vehicle Registration Modal */}
      <Modal
        title="Register Vehicle in Fleet"
        open={vehicleModalVisible}
        onCancel={() => setVehicleModalVisible(false)}
        onOk={handleCreateVehicle}
        confirmLoading={isCreatingVehicle}
        okText="Register Vehicle"
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 16 }}
        >
          <div>
            <Text strong>Registration / License Plate *</Text>
            <Input
              value={vehicleForm.registrationNumber}
              onChange={(e) =>
                setVehicleForm((p) => ({
                  ...p,
                  registrationNumber: e.target.value,
                }))
              }
              placeholder="e.g. DHA-GA-11-2345"
            />
          </div>
          <Row gutter={12}>
            <Col span={12}>
              <Text strong>Make *</Text>
              <Input
                value={vehicleForm.make}
                onChange={(e) =>
                  setVehicleForm((p) => ({ ...p, make: e.target.value }))
                }
                placeholder="e.g. Toyota / Isuzu"
              />
            </Col>
            <Col span={12}>
              <Text strong>Model *</Text>
              <Input
                value={vehicleForm.model}
                onChange={(e) =>
                  setVehicleForm((p) => ({ ...p, model: e.target.value }))
                }
                placeholder="e.g. Dyna / Elf"
              />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Text strong>Fuel Type</Text>
              <Select
                value={vehicleForm.fuelType}
                onChange={(v) => setVehicleForm((p) => ({ ...p, fuelType: v }))}
                style={{ width: "100%" }}
                options={[
                  { label: "Diesel", value: "DIESEL" },
                  { label: "Petrol", value: "PETROL" },
                  { label: "Electric", value: "ELECTRIC" },
                  { label: "Hybrid", value: "HYBRID" },
                ]}
              />
            </Col>
            <Col span={12}>
              <Text strong>Payload Capacity (kg)</Text>
              <InputNumber
                value={vehicleForm.capacityKg}
                onChange={(v) =>
                  setVehicleForm((p) => ({ ...p, capacityKg: v || 1000 }))
                }
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* Fuel Log Modal */}
      <Modal
        title="Record Fuel Refill"
        open={fuelModalVisible}
        onCancel={() => setFuelModalVisible(false)}
        onOk={handleLogFuel}
        confirmLoading={isLoggingFuel}
        okText="Save Fuel Log"
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 16 }}
        >
          <div>
            <Text strong>Select Vehicle *</Text>
            <Select
              value={fuelForm.vehicleId}
              onChange={(v) => setFuelForm((p) => ({ ...p, vehicleId: v }))}
              style={{ width: "100%" }}
              options={vehicles.map((v) => ({
                label: `${v.registrationNumber} (${v.make} ${v.model})`,
                value: v.id,
              }))}
            />
          </div>
          <Row gutter={12}>
            <Col span={12}>
              <Text strong>Odometer (km) *</Text>
              <InputNumber
                value={fuelForm.odometer}
                onChange={(v) =>
                  setFuelForm((p) => ({ ...p, odometer: v || 0 }))
                }
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={12}>
              <Text strong>Quantity (Liters) *</Text>
              <InputNumber
                value={fuelForm.fuelQuantity}
                onChange={(v) =>
                  setFuelForm((p) => ({ ...p, fuelQuantity: v || 0 }))
                }
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
          <div>
            <Text strong>Total Cost ($)</Text>
            <InputNumber
              value={fuelForm.cost}
              onChange={(v) => setFuelForm((p) => ({ ...p, cost: v || 0 }))}
              style={{ width: "100%" }}
            />
          </div>
        </Space>
      </Modal>

      {/* Trip Dispatch Modal */}
      <Modal
        title="Dispatch Trip / Delivery"
        open={tripModalVisible}
        onCancel={() => setTripModalVisible(false)}
        onOk={handleLogTrip}
        confirmLoading={isLoggingTrip}
        okText="Dispatch Trip"
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 16 }}
        >
          <div>
            <Text strong>Select Vehicle *</Text>
            <Select
              value={tripForm.vehicleId}
              onChange={(v) => setTripForm((p) => ({ ...p, vehicleId: v }))}
              style={{ width: "100%" }}
              options={vehicles.map((v) => ({
                label: `${v.registrationNumber} (${v.make} ${v.model})`,
                value: v.id,
              }))}
            />
          </div>
          <div>
            <Text strong>Origin *</Text>
            <Input
              value={tripForm.origin}
              onChange={(e) =>
                setTripForm((p) => ({ ...p, origin: e.target.value }))
              }
              placeholder="e.g. Central Warehouse Dock 3"
            />
          </div>
          <div>
            <Text strong>Destination *</Text>
            <Input
              value={tripForm.destination}
              onChange={(e) =>
                setTripForm((p) => ({ ...p, destination: e.target.value }))
              }
              placeholder="e.g. Outlet #14, North City Mall"
            />
          </div>
          <div>
            <Text strong>Estimated Distance (km)</Text>
            <InputNumber
              value={tripForm.distanceKm}
              onChange={(v) =>
                setTripForm((p) => ({ ...p, distanceKm: v || 1 }))
              }
              style={{ width: "100%" }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
