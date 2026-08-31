"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Space } from "antd";
import React, { useEffect } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  height = 300,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync value from props to editor (one-way for controlled component)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className="rich-text-editor"
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        className="editor-toolbar"
        style={{
          padding: "8px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
        }}
      >
        <Space size={4}>
          <Button
            size="small"
            type={editor.isActive("bold") ? "primary" : "text"}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            size="small"
            type={editor.isActive("italic") ? "primary" : "text"}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            size="small"
            type={editor.isActive("bulletList") ? "primary" : "text"}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <Button
            size="small"
            type={editor.isActive("orderedList") ? "primary" : "text"}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </Space>
      </div>
      <div
        style={{
          padding: "12px",
          minHeight: height,
          maxHeight: height * 2,
          overflowY: "auto",
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
