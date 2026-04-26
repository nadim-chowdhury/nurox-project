"use client";

import React from "react";
import Tree from "react-d3-tree";
import { Card, Spin, Empty, Typography } from "antd";
import { useGetOrgChartQuery } from "@/store/api/hrApi";

const { Title } = Typography;

export default function OrgChartPage() {
  const { data, isLoading, error } = useGetOrgChartQuery();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card style={{ margin: 24 }}>
        <Empty description="No organization data found" />
      </Card>
    );
  }

  // react-d3-tree expects a single root object.
  // If there are multiple roots (e.g. multiple CEOs), we wrap them in a virtual root.
  const treeData = data.length === 1 ? data[0] : {
    name: "Organization",
    children: data,
  };

  const containerStyles = {
    width: "100%",
    height: "calc(100vh - 200px)",
    background: "#fdfdfd",
    borderRadius: "12px",
    border: "1px solid #f0f0f0",
  };

  const renderForeignObjectNode = ({
    nodeDatum,
    toggleNode,
    foreignObjectProps,
  }: any) => (
    <g>
      <circle r={15} fill="#00b96b" onClick={toggleNode} />
      <foreignObject {...foreignObjectProps}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #c3f5ff",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "180px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#0c1324", textAlign: "center" }}>
            {nodeDatum.name}
          </div>
          <div style={{ fontSize: "12px", color: "#595959", marginTop: "4px" }}>
            {nodeDatum.attributes?.designation}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#00b96b",
              background: "#f0faff",
              padding: "2px 8px",
              borderRadius: "10px",
              marginTop: "6px",
            }}
          >
            {nodeDatum.attributes?.department}
          </div>
        </div>
      </foreignObject>
    </g>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Organization Chart</Title>
        <Typography.Text type="secondary">
          Visual hierarchy of company employees and reporting lines.
        </Typography.Text>
      </div>

      <div style={containerStyles}>
        <Tree
          data={treeData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 600, y: 100 }}
          nodeSize={{ x: 220, y: 200 }}
          renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({
              ...rd3tProps,
              foreignObjectProps: {
                width: 200,
                height: 200,
                x: -100,
                y: 20,
              },
            })
          }
        />
      </div>
    </div>
  );
}
