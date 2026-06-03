import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema),
  context: z.string().optional(), // Additional context like 'current user is looking at payroll page'
});

export type ChatMessageDto = z.infer<typeof chatMessageSchema>;
export type ChatRequestDto = z.infer<typeof chatRequestSchema>;

export const textGenerationRequestSchema = z.object({
  prompt: z.string().min(1),
  type: z.enum([
    "email",
    "meeting_summary",
    "report_description",
    "analytics",
    "support_analysis",
    "support_reply",
  ]),
  maxTokens: z.number().int().positive().optional(),
});

export type TextGenerationRequestDto = z.infer<
  typeof textGenerationRequestSchema
>;

export const documentExtractionRequestSchema = z.object({
  documentUrl: z.string().url(),
  documentType: z.enum(["resume", "invoice", "receipt"]),
});

export type DocumentExtractionRequestDto = z.infer<
  typeof documentExtractionRequestSchema
>;
