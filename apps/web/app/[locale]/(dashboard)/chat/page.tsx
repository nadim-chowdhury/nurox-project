"use client";

import React from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div style={{ height: "calc(100vh - 160px)" }}>
      <ChatInterface />
    </div>
  );
}
