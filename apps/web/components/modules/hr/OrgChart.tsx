"use client";

import React, { useMemo, useRef } from "react";
import Tree from "react-d3-tree";
import { Empty, Spin, Button, Space } from "antd";
import { DownloadOutlined, ZoomInOutlined, ZoomOutOutlined, FullscreenOutlined } from "@ant-design/icons";
import { toPng } from "html-to-image";

interface OrgChartProps {
  data: any[];
  loading?: boolean;
}

const containerStyles = {
  width: "100%",
  height: "700px",
  background: "var(--color-surface)",
  borderRadius: "8px",
  border: "1px solid var(--ghost-border)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

// Custom node component to match design system
const renderRectSvgNode = ({ nodeDatum, toggleNode }: any) => (
  <g>
    <rect
      width="220"
      height="70"
      x="-110"
      y="-35"
      rx="8"
      fill="var(--color-surface-variant)"
      stroke="var(--color-primary)"
      strokeWidth="1.5"
      onClick={toggleNode}
      style={{ cursor: 'pointer' }}
    />
    <text
      fill="var(--color-on-surface)"
      strokeWidth="0.5"
      x="0"
      y="-8"
      textAnchor="middle"
      style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-display)' }}
    >
      {nodeDatum.name}
    </text>
    <text
      fill="var(--color-on-surface-variant)"
      strokeWidth="0.5"
      x="0"
      y="12"
      textAnchor="middle"
      style={{ fontSize: '11px', fontFamily: 'var(--font-body)' }}
    >
      {nodeDatum.attributes?.designation || nodeDatum.code}
    </text>
    <text
      fill="var(--color-primary)"
      strokeWidth="0.5"
      x="0"
      y="26"
      textAnchor="middle"
      style={{ fontSize: '10px', fontWeight: 500 }}
    >
      {nodeDatum.attributes?.department}
    </text>
    {nodeDatum.children && nodeDatum.children.length > 0 && (
      <circle r="6" cy="35" fill="var(--color-primary)" onClick={toggleNode} style={{ cursor: 'pointer' }} />
    )}
  </g>
);

export function OrgChart({ data, loading }: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const treeData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // If multiple root departments, wrap them in a virtual root
    if (data.length > 1) {
      return {
        name: "Organization",
        attributes: { designation: "Root", department: "Global" },
        children: data,
      };
    }
    return data[0];
  }, [data]);

  const handleExport = async () => {
    if (!containerRef.current) return;
    
    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: '#0c1324', // Match Deep Space palette background
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `nurox-org-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export org chart', err);
    }
  };

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
    <div style={containerStyles} ref={containerRef} className="org-chart-container">
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 10,
        background: 'rgba(7, 13, 31, 0.6)',
        padding: '8px',
        borderRadius: '8px',
        backdropFilter: 'blur(4px)',
        border: '1px solid var(--ghost-border)'
      }}>
        <Space>
          <Tooltip title="Export as PNG">
            <Button icon={<DownloadOutlined />} onClick={handleExport} size="small" />
          </Tooltip>
        </Space>
      </div>
      
      <Tree
        data={treeData}
        orientation="vertical"
        translate={{ x: 500, y: 100 }}
        pathFunc="step"
        renderCustomNodeElement={renderRectSvgNode}
        nodeSize={{ x: 280, y: 140 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        enableLegacyTransitions={true}
        transitionDuration={500}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
      />
      <style jsx global>{`
        .rd3t-link {
          stroke: var(--ghost-border);
          stroke-width: 2;
          opacity: 0.6;
        }
        .org-chart-container .rd3t-tree-container {
            background: transparent !important;
        }
      `}</style>
    </div>
  );
}
