"use client";

import React, { useMemo } from "react";
import Tree from "react-d3-tree";
import { Card, Empty, Spin } from "antd";
import { ApartmentOutlined } from "@ant-design/icons";

interface OrgChartProps {
  data: any[];
  loading?: boolean;
}

const containerStyles = {
  width: "100%",
  height: "600px",
  background: "var(--color-surface)",
  borderRadius: "8px",
  border: "1px solid var(--ghost-border)",
};

// Custom node component to match design system
const renderRectSvgNode = ({ nodeDatum, toggleNode }: any) => (
  <g>
    <rect
      width="200"
      height="60"
      x="-100"
      y="-30"
      rx="8"
      fill="var(--ghost-bg)"
      stroke="var(--color-primary)"
      strokeWidth="1"
      onClick={toggleNode}
      style={{ cursor: 'pointer' }}
    />
    <text
      fill="var(--color-on-surface)"
      strokeWidth="0.5"
      x="0"
      y="-5"
      textAnchor="middle"
      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-display)' }}
    >
      {nodeDatum.name}
    </text>
    <text
      fill="var(--color-on-surface-variant)"
      strokeWidth="0.5"
      x="0"
      y="15"
      textAnchor="middle"
      style={{ fontSize: '11px', fontFamily: 'var(--font-body)' }}
    >
      {nodeDatum.code} {nodeDatum.costCenter ? `• ${nodeDatum.costCenter}` : ''}
    </text>
    {nodeDatum.children && nodeDatum.children.length > 0 && (
      <circle r="8" cy="30" fill="var(--color-primary)" onClick={toggleNode} style={{ cursor: 'pointer' }} />
    )}
  </g>
);

export function OrgChart({ data, loading }: OrgChartProps) {
  const treeData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // If multiple root departments, wrap them in a virtual root
    if (data.length > 1) {
      return {
        name: "Organization",
        code: "ROOT",
        children: data,
      };
    }
    return data[0];
  }, [data]);

  if (loading) {
    return (
      <div style={{ ...containerStyles, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Generating Org Chart..." />
      </div>
    );
  }

  if (!treeData) {
    return (
      <div style={{ ...containerStyles, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No organization structure found" />
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <Tree
        data={treeData}
        orientation="vertical"
        translate={{ x: 500, y: 50 }}
        pathFunc="step"
        renderCustomNodeElement={renderRectSvgNode}
        nodeSize={{ x: 250, y: 120 }}
        separation={{ siblings: 1.2, nonSiblings: 2 }}
        enableLegacyTransitions={true}
        transitionDuration={500}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
      />
      <style jsx global>{`
        .rd3t-link {
          stroke: var(--ghost-border);
          stroke-width: 1.5;
        }
      `}</style>
    </div>
  );
}
