"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Input,
  Avatar,
  List,
  Typography,
  Badge,
  Button,
  Spin,
  Divider,
} from "antd";
import { SendOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import { useSocket } from "../providers/SocketProvider";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useGetChannelsQuery,
  useGetMessagesQuery,
  ChatMessage,
} from "@/store/api/chatApi";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";

const { Sider, Content } = Layout;
const { Text } = Typography;

export function ChatInterface() {
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();
  const user = useAppSelector((s) => s.auth.user);

  const { data: channels, isLoading: channelsLoading } = useGetChannelsQuery();
  const { data: initialMessages, isLoading: messagesLoading } =
    useGetMessagesQuery(activeChannel || "", {
      skip: !activeChannel,
    });

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (initialMessages) {
      setMessages([...initialMessages].reverse()); // Assume API returns latest first, we want oldest first for chat flow
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!channelsLoading && channels && channels.length > 0 && !activeChannel) {
      if (channels[0]?.id) setActiveChannel(channels[0].id);
    }
  }, [channels, channelsLoading, activeChannel]);

  useEffect(() => {
    if (!socket || !activeChannel) return;

    socket.emit("join_channel", { channelId: activeChannel });

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.channelId === activeChannel) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_channel", { channelId: activeChannel });
    };
  }, [socket, activeChannel]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: ({ query }) => {
            return ["everyone", "here", "admin"]
              .filter((item) =>
                item.toLowerCase().startsWith(query.toLowerCase()),
              )
              .slice(0, 5);
          },
        },
      }),
    ],
    content: "",
  });

  const handleSend = () => {
    if (!editor || editor.isEmpty || !activeChannel || !socket) return;

    socket.emit("send_message", {
      channelId: activeChannel,
      content: editor.getHTML(),
      mentions: [], // Parse mentions from tiptap in a real app
    });

    editor.commands.clearContent();
  };

  if (channelsLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout
      style={{
        height: "100%",
        background: "#fff",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Sider
        width={300}
        style={{ background: "#fafafa", borderRight: "1px solid #f0f0f0" }}
      >
        <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
          <Input.Search placeholder="Search channels..." />
        </div>
        <Menu
          mode="inline"
          selectedKeys={activeChannel ? [activeChannel] : []}
          style={{ borderRight: 0, background: "transparent" }}
          items={channels?.map((c) => ({
            key: c.id,
            icon: c.type === "GROUP" ? <MessageOutlined /> : <UserOutlined />,
            label: c.name || "Direct Message",
            onClick: () => setActiveChannel(c.id),
          }))}
        />
      </Sider>
      <Content style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            {channels?.find((c) => c.id === activeChannel)?.name || "Chat"}
          </Text>
          <Badge
            status={isConnected ? "success" : "default"}
            text={isConnected ? "Connected" : "Disconnected"}
          />
        </div>

        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messagesLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  {!isMine && (
                    <Avatar style={{ marginRight: 8, marginTop: 4 }}>
                      {msg.sender?.firstName?.[0] || "U"}
                    </Avatar>
                  )}
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "10px 14px",
                      borderRadius: 16,
                      borderTopLeftRadius: !isMine ? 4 : 16,
                      borderTopRightRadius: isMine ? 4 : 16,
                      background: isMine ? "var(--color-primary)" : "#f0f2f5",
                      color: isMine ? "#fff" : "inherit",
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.7,
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              padding: "8px 12px",
              background: "#fff",
            }}
          >
            <EditorContent
              editor={editor}
              style={{ minHeight: 40, outline: "none" }}
            />
          </div>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!isConnected || !activeChannel}
          >
            Send
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
