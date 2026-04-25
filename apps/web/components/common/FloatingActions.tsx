"use client";

import React from "react";
import { FloatButton } from "antd";
import { 
  PlusOutlined, 
  QuestionCircleOutlined, 
  CustomerServiceOutlined,
  PrinterOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import { usePathname } from "next/navigation";

export function FloatingActions() {
  const pathname = usePathname();
  
  // Decide what actions to show based on the current module
  const isFinance = pathname.includes("/finance");
  const isHR = pathname.includes("/hr");
  
  return (
    <FloatButton.Group
      trigger="hover"
      type="primary"
      style={{ right: 24, bottom: 24 }}
      icon={<PlusOutlined />}
    >
      <FloatButton icon={<QuestionCircleOutlined />} tooltip={<div>Help & Docs</div>} />
      <FloatButton icon={<CustomerServiceOutlined />} tooltip={<div>Support Ticket</div>} />
      
      {(isFinance || isHR) && (
        <>
          <FloatButton icon={<PrinterOutlined />} tooltip={<div>Print Report</div>} />
          <FloatButton icon={<ShareAltOutlined />} tooltip={<div>Share Page</div>} />
        </>
      )}
      
      <FloatButton.BackTop visibilityHeight={400} />
    </FloatButton.Group>
  );
}
