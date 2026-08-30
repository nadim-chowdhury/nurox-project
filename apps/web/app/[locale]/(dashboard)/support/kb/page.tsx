"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  Button,
  List,
  Tag,
  Space,
  Alert,
  Modal,
  Input,
  message,
} from "antd";
import {
  BulbOutlined,
  SearchOutlined,
  PlusOutlined,
  RobotOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  useGetKbArticlesQuery,
  useAnalyzeKbGapsMutation,
  useCreateKbArticleMutation,
} from "@/store/api/supportApi";

const { Title, Text, Paragraph } = Typography;

interface KbArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
}

interface GapSuggestion {
  title: string;
  reason: string;
  suggestedCategory: string;
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: articles = [], isLoading: loadingArticles } =
    useGetKbArticlesQuery({ q: searchQuery });
  const [analyzeGaps, { isLoading: analyzing }] = useAnalyzeKbGapsMutation();
  const [createArticle] = useCreateKbArticleMutation();

  const [gapSuggestions, setGapSuggestions] = useState<GapSuggestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGapAnalysis = async () => {
    try {
      const res = await analyzeGaps().unwrap();
      if (res.suggestions) {
        setGapSuggestions(res.suggestions as GapSuggestion[]);
        setIsModalOpen(true);
      } else if (res.message) {
        message.info(res.message);
      }
    } catch {
      message.error("Failed to perform gap analysis");
    }
  };

  const handleCreateFromSuggestion = async (suggestion: GapSuggestion) => {
    try {
      await createArticle({
        title: suggestion.title,
        content: `Draft for: ${suggestion.reason}`,
        category: suggestion.suggestedCategory,
        isPublic: false,
      }).unwrap();
      message.success(`Draft article created: ${suggestion.title}`);
    } catch {
      message.error("Failed to create draft article");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>Knowledge Base</Title>
          <Text type="secondary">
            Manage your help articles and documentation.
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info("Manual article creation coming soon!")}
          >
            Create Article
          </Button>
          <Button
            icon={<RobotOutlined />}
            onClick={handleGapAnalysis}
            loading={analyzing}
            className="ant-btn-secondary"
          >
            AI Gap Analysis
          </Button>
        </Space>
      </div>

      <div className="mb-6">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search articles..."
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <List
          loading={loadingArticles}
          dataSource={
            (Array.isArray(articles)
              ? articles
              : (articles as any)?.data || []) as KbArticle[]
          }
          renderItem={(article) => (
            <List.Item
              actions={[
                <Button key="edit" type="link">
                  Edit
                </Button>,
                <Button key="view" type="link">
                  View
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{article.title}</Text>}
                description={
                  <Space>
                    <Tag color="blue">{article.category}</Tag>
                    <Tag
                      color={
                        article.status === "PUBLISHED" ? "green" : "orange"
                      }
                    >
                      {article.status}
                    </Tag>
                  </Space>
                }
              />
              <div style={{ maxWidth: 400 }}>
                <Paragraph ellipsis={{ rows: 1 }}>{article.content}</Paragraph>
              </div>
            </List.Item>
          )}
          locale={{
            emptyText:
              "No articles found. Try performing an AI Gap Analysis to see what's missing!",
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: "#faad14" }} />
            <span>AI Knowledge Base Gap Analysis</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <Alert
          message="AI Analysis Result"
          description="Based on your recent 50 tickets, here are the most frequent issues that aren't covered by your current Knowledge Base articles."
          type="info"
          showIcon
          className="mb-4"
        />

        <List
          dataSource={gapSuggestions}
          renderItem={(item) => (
            <List.Item
              key={item.title}
              className="border p-4 mb-4 rounded bg-slate-50"
              actions={[
                <Button
                  type="primary"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  onClick={() => handleCreateFromSuggestion(item)}
                >
                  Create Draft
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.title}</Text>}
                description={
                  <div>
                    <Paragraph italic className="mb-1">
                      {item.reason}
                    </Paragraph>
                    <Tag color="cyan">{item.suggestedCategory}</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
