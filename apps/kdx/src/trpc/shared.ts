import type { Message } from "@ai-sdk/react";
import type { TRPCClientError } from "@trpc/client";

import type { AppRouter, RouterOutputs } from "@kdx/api";

// Tipos baseados na estrutura real da API
export type ChatFolderType =
  RouterOutputs["app"]["chat"]["findChatFolders"]["folders"][number];

export type ChatSessionType =
  RouterOutputs["app"]["chat"]["findSessions"]["sessions"][number];

export type AgentType =
  RouterOutputs["app"]["aiStudio"]["findAiAgents"]["agents"][number];

export type ModelType =
  RouterOutputs["app"]["aiStudio"]["findAvailableModels"][number];

// Tipos para chat-window.tsx
export interface ChatWindowProps {
  sessionId?: string;
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string;
  selectedAgentId?: string | null;
  onStreamingFinished?: () => void;
}

export interface EmptyThreadStateProps {
  onNewSession?: (sessionId: string) => void;
  selectedModelId?: string;
}

// Reexportar para consistência
export type ChatSDKMessageType = Message;
export type TRPCClientErrorType = TRPCClientError<AppRouter>;

export type BadgeVariantType =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "green";

export type ModelInfoBadgeSessionDataType =
  RouterOutputs["app"]["chat"]["findSession"];

/**
 * @deprecated Use `LastMessageMetadata` instead. This type is inferred from a JSON field and is not safe.
 */
export type ModelInfoBadgeLastMessageMetadataType =
  RouterOutputs["app"]["chat"]["getMessages"]["messages"][number]["metadata"];

// DTO (Contrato de Dados) explícito e seguro
export interface LastMessageMetadata {
  actualModelUsed: string | undefined;
  timestamp: string;
}
