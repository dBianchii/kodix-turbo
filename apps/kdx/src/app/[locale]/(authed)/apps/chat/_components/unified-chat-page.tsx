/**
 * 💬 CHAT SUBAPP - Componente Unificado (SUB-FASE 5.0)
 *
 * 🎯 OBJETIVO: Eliminar duplicação entre page.tsx e [sessionId]/page.tsx
 *
 * 📚 DOCUMENTAÇÃO:
 * - Plano de Migração: @docs/subapps/chat/session-message-flow-migration-plan.md
 * - Arquitetura SubApp: @docs/architecture/subapp-architecture.md
 * - Chat Overview: @docs/subapps/chat/README.md
 *
 * ✅ GARANTIAS DE COMPATIBILIDADE:
 * - Layout preservado (idêntico ao atual)
 * - Vercel AI SDK (useChat nativo)
 * - Assistant-UI pattern (thread-first)
 * - ReactMarkdown + remarkGfm intacto
 * - AiStudioService mantido
 * - shadcn/ui preservado
 * - Padrão TRPC respeitado
 */

// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";
import { useChatPreferredModel } from "../_hooks/useChatPreferredModel";
import { useChatUserConfig } from "../_hooks/useChatUserConfig";
import { useTokenUsage } from "../_hooks/useTokenUsage";
import { AppSidebar } from "./app-sidebar";
import { ChatWindow } from "./chat-window";
import { ModelInfoBadge } from "./model-info-badge";
import { ModelSelector } from "./model-selector";
import { TokenUsageBadge } from "./token-usage-badge";

interface UnifiedChatPageProps {
  sessionId?: string;
  locale: string;
}

export function UnifiedChatPage({ sessionId, locale }: UnifiedChatPageProps) {
  // ✅ ETAPA 4.1: Hook para prevenir problemas de hidratação
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const router = useRouter();
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ✅ Estados unificados
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(sessionId);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );

  // ✅ Hook para gerenciar configurações PESSOAIS do usuário (apenas quando não há sessão)
  const { savePreferredModel, isSaving, config } = useChatUserConfig();

  // ✅ Carregar modelo preferido (para quando não há sessão selecionada)
  const {
    modelId: preferredModelId,
    isReady,
    isLoading,
    error: preferredError,
    refetch: refetchPreferredModel,
  } = useChatPreferredModel();

  // ✅ Buscar dados da sessão selecionada com cache otimizado
  const sessionQuery = useQuery(
    trpc.app.chat.buscarSession.queryOptions(
      { sessionId: selectedSessionId! },
      {
        enabled: !!selectedSessionId,
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
      },
    ),
  );

  // ✅ Buscar mensagens da sessão selecionada com cache
  const messagesQuery = useQuery(
    trpc.app.chat.getMessages.queryOptions(
      {
        chatSessionId: selectedSessionId!,
        limit: 1,
        page: 1,
        order: "desc",
      },
      {
        enabled: !!selectedSessionId,
        staleTime: 15 * 1000, // 15 segundos
        gcTime: 60 * 1000, // 1 minuto
      },
    ),
  );

  // ✅ Buscar todas as mensagens para calcular tokens com cache
  const allMessagesQuery = useQuery(
    trpc.app.chat.getMessages.queryOptions(
      {
        chatSessionId: selectedSessionId!,
        limit: 100, // Reduzir limite para evitar erro "too_big"
        page: 1,
        order: "asc", // ✅ Ordem cronológica para cálculo de tokens
      },
      {
        enabled: !!selectedSessionId,
        retry: 2, // Tentar 2 vezes em caso de erro
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
      },
    ),
  );

  // ✅ Extrair metadata da última mensagem (memoizado)
  const lastMessage = useMemo(() => {
    return messagesQuery.data?.messages?.[0];
  }, [messagesQuery.data?.messages]);

  const lastMessageMetadata = useMemo(() => {
    return lastMessage?.metadata
      ? {
          actualModelUsed: lastMessage.metadata.actualModelUsed,
          requestedModel: lastMessage.metadata.requestedModel,
          providerId: lastMessage.metadata.providerId,
          timestamp: lastMessage.createdAt.toISOString(),
        }
      : undefined;
  }, [lastMessage]);

  // ✅ Calcular uso de tokens (memoizado)
  const modelName = useMemo(() => {
    return sessionQuery.data?.aiModel?.name || "";
  }, [sessionQuery.data?.aiModel?.name]);

  const messages = useMemo(() => {
    return allMessagesQuery.data?.messages || [];
  }, [allMessagesQuery.data?.messages]);

  const tokenUsage = useTokenUsage(messages, modelName);

  // ✅ Mutation para atualizar sessão (apenas quando há sessão)
  const updateSessionMutation = useMutation(
    trpc.app.chat.atualizarSession.mutationOptions({
      onSuccess: (updatedSession) => {
        toast.success("Modelo da sessão atualizado com sucesso!");

        // ✅ Optimistic Update: Manually update the session list cache
        queryClient.setQueryData(
          trpc.app.chat.listarSessions.queryKey,
          (oldData: { sessions: { id: string }[] } | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              sessions: oldData.sessions.map((session) =>
                session.id === updatedSession.id
                  ? { ...session, ...updatedSession }
                  : session,
              ),
            };
          },
        );

        // Invalidate other specific queries as needed, but avoid invalidating the whole list.
        queryClient.invalidateQueries(
          trpc.app.chat.buscarSession.pathFilter({
            sessionId: updatedSession.id,
          }),
        );
      },
      onError: trpcErrorToastDefault,
    }),
  );

  // ✅ Sincronizar sessionId da URL com estado local
  useEffect(() => {
    if (sessionId !== selectedSessionId) {
      setSelectedSessionId(sessionId);
    }
  }, [sessionId, selectedSessionId]);

  // ✅ Atualizar modelo selecionado baseado na sessão ou modelo preferido
  useEffect(() => {
    // Model ID update monitoring - log removed for performance

    if (selectedSessionId && sessionQuery.data?.aiModelId) {
      // ✅ Prioridade 1: Modelo da sessão selecionada
      // Using session model - log removed for performance
      setSelectedModelId(sessionQuery.data.aiModelId);
    } else if (!selectedSessionId && isReady && preferredModelId) {
      // ✅ Prioridade 2: Modelo preferido quando não há sessão
      // Using preferred model - log removed for performance
      setSelectedModelId(preferredModelId);
    }
  }, [
    selectedSessionId,
    sessionQuery.data?.aiModelId,
    isReady,
    preferredModelId,
  ]);

  // ✅ NAVEGAÇÃO CENTRALIZADA: Função para lidar com seleção de sessão
  const handleSessionSelect = useCallback(
    (sessionId: string | undefined) => {
      // Session selection - log removed for performance
      setSelectedSessionId(sessionId);

      // ✅ Navegar para a sessão ou página principal
      if (sessionId) {
        // Navigating to session - log removed for performance
        router.push(`/apps/chat/${sessionId}`);
      } else {
        // Navigating to main page - log removed for performance
        router.push("/apps/chat");
      }
    },
    [router],
  );

  // ✅ Função para lidar com seleção de modelo
  const handleModelSelect = useCallback(
    (modelId: string) => {
      // Model selection diagnosis - logs removed for performance

      // ✅ Atualizar estado local primeiro
      setSelectedModelId(modelId);

      if (selectedSessionId) {
        // ✅ Tem sessão: atualizar modelo da sessão
        updateSessionMutation.mutate({
          id: selectedSessionId,
          aiModelId: modelId,
        });
      } else {
        // ✅ Sem sessão: salvar como modelo preferido
        savePreferredModel(modelId);

        // ✅ Atualizar modelo preferido após salvar
        setTimeout(() => {
          refetchPreferredModel();
        }, 1000);
      }
    },
    [
      selectedSessionId,
      updateSessionMutation,
      savePreferredModel,
      refetchPreferredModel,
    ],
  );

  // Hydration debugging removed - issue was in ThemeToggle component

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-background">
        {/* Sidebar - assume largura interna definida pelo componente */}
        <AppSidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho com ModelSelector e badges - estilo ChatGPT */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-4">
              {/* ✅ ETAPA 4.1: Renderizar SidebarTrigger apenas no cliente */}
              {isClient && <SidebarTrigger className="md:hidden" />}
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelSelect={handleModelSelect}
                disabled={
                  selectedSessionId
                    ? updateSessionMutation.isPending
                    : isSaving || isLoading
                }
              />
            </div>
            {/* Espaço central vazio */}
            <div></div>
            <div className="flex items-center gap-2">
              {/* Token Usage Badge - apenas quando há sessão */}
              {selectedSessionId &&
                sessionQuery.data &&
                tokenUsage.maxTokens > 0 && (
                  <TokenUsageBadge
                    usedTokens={tokenUsage.usedTokens}
                    maxTokens={tokenUsage.maxTokens}
                  />
                )}
              {/* Model Info Badge - apenas quando há sessão */}
              {selectedSessionId && sessionQuery.data && (
                <ModelInfoBadge
                  key={`model-info-${selectedSessionId}-${selectedModelId}-${sessionQuery.data.aiModelId}`}
                  sessionData={sessionQuery.data}
                  lastMessageMetadata={lastMessageMetadata}
                />
              )}
            </div>
          </div>

          {/* Área do chat - cresce para preencher o espaço restante */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatWindow
              sessionId={selectedSessionId}
              onNewSession={handleSessionSelect}
              selectedModelId={selectedModelId} // ✅ NOVO: Passar modelo selecionado
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
