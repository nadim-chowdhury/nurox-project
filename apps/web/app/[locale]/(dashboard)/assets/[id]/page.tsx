"use client";
import { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Space,
  Timeline,
  Divider,
  Skeleton,
  message,
} from "antd";
import {
  PrinterOutlined,
  ToolOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetAssetDetailsQuery,
  useGenerateQRMutation,
} from "@/store/api/assetsApi";

const { Title, Text } = Typography;

export default function AssetDetailsPage() {
  const { id } = useParams();
  const { data: asset, isLoading } = useGetAssetDetailsQuery(id as string, {
    skip: !id,
  });
  const [generateQR, { isLoading: isGeneratingQR }] = useGenerateQRMutation();

  const handlePrintQR = async () => {
    try {
      if (!asset?.qrCodeUrl) {
        await generateQR(id as string).unwrap();
        message.success("QR Code generated successfully");
      }
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      message.error("Failed to generate QR code");
    }
  };

  if (isLoading)
    return (
      <div style={{ padding: "50px" }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  if (!asset)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Asset not found
      </div>
    );

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={asset.name}
        subtitle={`Asset Code: ${asset.assetCode} · Status: ${asset.status}`}
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: "Details" },
        ]}
        extra={
          <Space>
            <Button
              icon={<ToolOutlined />}
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--ghost-border)",
                color: "var(--color-warning)",
              }}
            >
              Log Maintenance
            </Button>
            <Button
              type="primary"
              className="ant-btn-primary"
              icon={<PrinterOutlined />}
              onClick={handlePrintQR}
              loading={isGeneratingQR}
            >
              Print Label
            </Button>
          </Space>
        }
      />

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={16}>
          <div
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--ghost-border)",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <Title
              level={4}
              className="font-display"
              style={{ color: "var(--color-on-surface)", marginTop: 0 }}
            >
              Asset Details
            </Title>
            <Divider style={{ borderColor: "var(--ghost-border)" }} />

            <Row gutter={[16, 24]}>
              <Col span={8}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  Category
                </Text>
                <Text
                  style={{ color: "var(--color-on-surface)", fontWeight: 500 }}
                >
                  {asset.category?.name || "Uncategorized"}
                </Text>
              </Col>
              <Col span={8}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  Location
                </Text>
                <Text
                  style={{ color: "var(--color-on-surface)", fontWeight: 500 }}
                >
                  {asset.location || "N/A"}
                </Text>
              </Col>
              <Col span={8}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  Assigned To
                </Text>
                <Text
                  style={{ color: "var(--color-primary)", fontWeight: 500 }}
                >
                  {asset.assignedEmployee
                    ? `${asset.assignedEmployee.firstName} ${asset.assignedEmployee.lastName}`
                    : "Unassigned"}
                </Text>
              </Col>

              <Col span={8}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  Purchase Cost
                </Text>
                <Text
                  style={{ color: "var(--color-on-surface)", fontWeight: 500 }}
                >
                  ${Number(asset.purchaseCost || 0).toFixed(2)}
                </Text>
              </Col>
              <Col span={8}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  Net Book Value
                </Text>
                <Text
                  className="font-display"
                  style={{ color: "var(--color-success)", fontWeight: 600 }}
                >
                  $
                  {Number(
                    asset.netBookValue || asset.purchaseCost || 0,
                  ).toFixed(2)}
                </Text>
              </Col>
              <Col span={8}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  Depreciation Method
                </Text>
                <Text
                  style={{ color: "var(--color-on-surface)", fontWeight: 500 }}
                >
                  {asset.depreciationMethod || "NONE"}
                </Text>
              </Col>
            </Row>
          </div>

          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--ghost-border)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <Title
              level={4}
              className="font-display"
              style={{ color: "var(--color-on-surface)", marginTop: 0 }}
            >
              <HistoryOutlined style={{ marginRight: "8px" }} />
              Lifecycle & History
            </Title>
            <Divider style={{ borderColor: "var(--ghost-border)" }} />

            <Timeline
              items={[
                {
                  color: "blue",
                  children: (
                    <div>
                      <Text
                        style={{
                          color: "var(--color-on-surface-variant)",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        {new Date(asset.purchaseDate).toLocaleDateString()}
                      </Text>
                      <Text
                        style={{
                          color: "var(--color-on-surface)",
                          fontWeight: 500,
                        }}
                      >
                        PURCHASED
                      </Text>
                    </div>
                  ),
                },
                ...(asset.assignments || []).map((assignment: any) => ({
                  color: assignment.returnDate ? "gray" : "green",
                  children: (
                    <div>
                      <Text
                        style={{
                          color: "var(--color-on-surface-variant)",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        {new Date(
                          assignment.assignmentDate,
                        ).toLocaleDateString()}
                      </Text>
                      <Text
                        style={{
                          color: "var(--color-on-surface)",
                          fontWeight: 500,
                        }}
                      >
                        ASSIGNED
                      </Text>
                      <Text
                        style={{
                          color: "var(--color-on-surface)",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Assigned to employee ID: {assignment.employeeId}
                      </Text>
                    </div>
                  ),
                })),
                ...(asset.maintenances || []).map((maint: any) => ({
                  color: "orange",
                  children: (
                    <div>
                      <Text
                        style={{
                          color: "var(--color-on-surface-variant)",
                          fontSize: "12px",
                          display: "block",
                        }}
                      >
                        {new Date(maint.maintenanceDate).toLocaleDateString()}
                      </Text>
                      <Text
                        style={{
                          color: "var(--color-on-surface)",
                          fontWeight: 500,
                        }}
                      >
                        MAINTENANCE
                      </Text>
                      <Text
                        style={{
                          color: "var(--color-on-surface)",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Cost: ${Number(maint.cost).toFixed(2)} -{" "}
                        {maint.description}
                      </Text>
                    </div>
                  ),
                })),
              ]}
            />
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--ghost-border)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
            }}
            className="print-section"
          >
            <Title
              level={4}
              className="font-display"
              style={{ color: "var(--color-on-surface)", marginTop: 0 }}
            >
              Asset Tag
            </Title>
            <div
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "8px",
                display: "inline-block",
                marginTop: "16px",
                boxShadow: "var(--shadow-float)",
              }}
            >
              {asset.qrCodeUrl ? (
                <img
                  src={asset.qrCodeUrl}
                  alt="QR Code"
                  style={{ width: 150, height: 150 }}
                />
              ) : (
                <div
                  style={{
                    width: 150,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ccc",
                  }}
                >
                  No QR generated
                </div>
              )}
            </div>
            <div style={{ marginTop: "16px" }}>
              <Text
                className="font-display"
                style={{
                  color: "var(--color-primary)",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {asset.assetCode}
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
