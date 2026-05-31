"use client";

import React from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Badge,
  Empty,
  Spin,
  Alert,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useGenerateDemandForecastMutation,
  useGetDemandForecastsQuery,
} from "@/store/api/analyticsApi";
import { RobotOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface DemandForecastWidgetProps {
  productId: string;
}

export function DemandForecastWidget({ productId }: DemandForecastWidgetProps) {
  const {
    data: forecasts,
    isLoading,
    refetch,
  } = useGetDemandForecastsQuery(productId);
  const [generate, { isLoading: isGenerating }] =
    useGenerateDemandForecastMutation();

  const handleGenerate = async () => {
    await generate({ productId, months: 3 });
    refetch();
  };

  const chartData = forecasts?.map((f) => ({
    date: dayjs(f.forecastDate).format("MMM YYYY"),
    predicted: Number(f.predictedQuantity),
    confidence: Number(f.confidenceScore) * 100,
  }));

  const columns = [
    {
      title: "Period",
      dataIndex: "forecastDate",
      key: "date",
      render: (date: string) => dayjs(date).format("MMMM YYYY"),
    },
    {
      title: "Predicted Demand",
      dataIndex: "predictedQuantity",
      key: "predicted",
      render: (qty: number) => <Text strong>{qty} units</Text>,
    },
    {
      title: "Confidence",
      dataIndex: "confidenceScore",
      key: "confidence",
      render: (score: number) => (
        <Badge
          status={score > 0.8 ? "success" : score > 0.5 ? "warning" : "error"}
          text={`${(score * 100).toFixed(0)}%`}
        />
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <RobotOutlined /> <Text strong>AI Demand Forecast</Text>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleGenerate}
          loading={isGenerating}
          size="small"
        >
          Regenerate
        </Button>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin tip="Analyzing trends..." />
        </div>
      ) : forecasts && forecasts.length > 0 ? (
        <Space direction="vertical" style={{ width: "100%" }} size={24}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Demand"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Alert
            message="AI Reasoning"
            description={forecasts[0]?.aiReasoning}
            type="info"
            showIcon
          />

          <Table
            dataSource={forecasts}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="id"
          />
        </Space>
      ) : (
        <Empty
          description="No forecasts generated yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="dashed" onClick={handleGenerate} loading={isGenerating}>
            Start AI Analysis
          </Button>
        </Empty>
      )}
    </Card>
  );
}
