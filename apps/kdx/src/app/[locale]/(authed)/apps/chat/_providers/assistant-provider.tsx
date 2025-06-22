"use client";

import type { ReactNode } from "react";
import { useAssistant } from "@ai-sdk/react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useVercelUseAssistantRuntime } from "@assistant-ui/react-ai-sdk";

export function ChatAssistantProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // 🚀 ASSISTANT-UI: Hook do AI SDK para integração
  const assistant = useAssistant({
    api: "/api/assistant",
  });

  // 🚀 ASSISTANT-UI: Runtime oficial do Assistant-UI
  const runtime = useVercelUseAssistantRuntime(assistant);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
