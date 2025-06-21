// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useTRPC } from "~/trpc/react";
import { AppSidebar } from "../_components/app-sidebar";
import { ChatWindow } from "../_components/chat-window";
import { ModelInfoBadge } from "../_components/model-info-badge";
import { ModelSelector } from "../_components/model-selector";
import { TokenUsageBadge } from "../_components/token-usage-badge";
import { useChatPreferredModel } from "../_hooks/useChatPreferredModel";
import { useTokenUsage } from "../_hooks/useTokenUsage";

export default function ChatSessionPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // 🔍 DEBUG: Log inicial para verificar se a página está carregando

  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessionId);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );

  // ✅ Carregar modelo preferido como fallback
  const { modelId: preferredModelId, isReady } = useChatPreferredModel();

  // ✅ Buscar dados da sessão para obter o modelo da sessão
  const sessionQuery = useQuery(
    trpc.app.chat.buscarSession.queryOptions(
      { sessionId },
      { enabled: !!sessionId },
    ),
  );

  // ✅ Buscar última mensagem para obter metadata do modelo real usado
  const messagesQuery = useQuery(
    trpc.app.chat.buscarMensagensTest.queryOptions(
      {
        chatSessionId: sessionId,
        limite: 1,
        pagina: 1,
        ordem: "desc", // ✅ Buscar mensagem mais recente primeiro
      },
      { enabled: !!sessionId },
    ),
  );

  // ✅ Buscar todas as mensagens para calcular tokens
  const allMessagesQuery = useQuery(
    trpc.app.chat.buscarMensagensTest.queryOptions(
      {
        chatSessionId: sessionId,
        limite: 100, // Reduzir limite para evitar erro "too_big"
        pagina: 1,
        ordem: "asc", // ✅ Ordem cronológica para cálculo de tokens
      },
      {
        enabled: !!sessionId,
        retry: 2, // Tentar 2 vezes em caso de erro
      },
    ),
  );

  // ✅ Extrair metadata da última mensagem
  const lastMessage = messagesQuery.data?.messages?.[0];
  const lastMessageMetadata = lastMessage?.metadata
    ? {
        actualModelUsed: lastMessage.metadata.actualModelUsed,
        requestedModel: lastMessage.metadata.requestedModel,
        providerId: lastMessage.metadata.providerId,
        timestamp: lastMessage.createdAt,
      }
    : undefined;

  // ✅ Calcular uso de tokens
  const modelName = sessionQuery.data?.aiModel?.name || "";
  const messages = allMessagesQuery.data?.messages || [];

  // 🔍 DEBUG: Teste manual de cálculo de tokens
  const testTokens = messages.reduce((total, msg) => {
    return total + Math.ceil((msg.content || "").length / 4);
  }, 0);

  const tokenUsage = useTokenUsage(messages, modelName);

  // 🔍 DEBUG: Log para verificar dados

  // ✅ Mutation para atualizar modelo da sessão
  const updateSessionMutation = useMutation(
    trpc.app.chat.atualizarSession.mutationOptions({
      onSuccess: () => {
        toast.success("Modelo atualizado com sucesso!");
        // ✅ Invalidar queries para atualizar dados
        queryClient.invalidateQueries(
          trpc.app.chat.buscarSession.pathFilter({ sessionId }),
        );
        queryClient.invalidateQueries(
          trpc.app.chat.buscarMensagensTest.pathFilter(),
        );
      },
      onError: trpcErrorToastDefault,
    }),
  );

  // 🔍 DEBUG: useEffect para logs em tempo real

  // Atualizar modelo selecionado baseado na sessão atual
  useEffect(() => {
    if (sessionQuery.data?.aiModelId) {
      // ✅ Prioridade 1: Modelo da sessão
      setSelectedModelId(sessionQuery.data.aiModelId);
    } else if (isReady && preferredModelId && !selectedModelId) {
      // ✅ Prioridade 2: Modelo preferido como fallback
      setSelectedModelId(preferredModelId);
    }
  }, [
    sessionQuery.data?.aiModelId,
    isReady,
    preferredModelId,
    selectedModelId,
  ]);

  const handleSessionSelect = (newSessionId: string | undefined) => {
    if (newSessionId) {
      setSelectedSessionId(newSessionId);
      // Navegar para a nova sessão usando router
      router.push(`/apps/chat/${newSessionId}`);
    } else {
      // ✅ Navegar para a página principal quando for "Novo Chat"
      router.push("/apps/chat");
    }
  };

  const handleModelSelect = (modelId: string) => {
    const previousModelId = selectedModelId;

    // ✅ Atualizar estado local imediatamente (double optimistic)
    setSelectedModelId(modelId);

    // ✅ Atualizar modelo da sessão no banco de dados com optimistic update
    updateSessionMutation.mutate({
      id: sessionId,
      aiModelId: modelId,
    });
  };

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Sidebar */}
        <AppSidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho com ModelSelector e ModelInfoBadge - estilo ChatGPT */}
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelSelect={handleModelSelect}
                disabled={updateSessionMutation.isPending}
              />
            </div>
            <div className="flex items-center gap-2">
              {sessionQuery.data && (
                <TokenUsageBadge
                  usedTokens={tokenUsage.usedTokens}
                  maxTokens={tokenUsage.maxTokens}
                />
              )}
              {sessionQuery.data && (
                <ModelInfoBadge
                  sessionData={sessionQuery.data}
                  lastMessageMetadata={lastMessageMetadata}
                />
              )}
            </div>
          </div>

          {/* Área do chat */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatWindow
              sessionId={selectedSessionId}
              onNewSession={(newSessionId) => {
                console.log(
                  "🎯 [SESSION_PAGE] Nova sessão criada:",
                  newSessionId,
                );
                handleSessionSelect(newSessionId);
              }}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
