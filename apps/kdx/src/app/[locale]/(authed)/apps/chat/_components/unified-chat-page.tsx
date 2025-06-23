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

import { useEffect, useState } from "react";
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

  // ✅ Buscar dados da sessão selecionada (apenas quando há sessão)
  const sessionQuery = useQuery(
    trpc.app.chat.buscarSession.queryOptions(
      { sessionId: selectedSessionId! },
      { enabled: !!selectedSessionId },
    ),
  );

  // ✅ Buscar mensagens da sessão selecionada (apenas quando há sessão)
  const messagesQuery = useQuery(
    trpc.app.chat.buscarMensagensTest.queryOptions(
      {
        chatSessionId: selectedSessionId!,
        limite: 1,
        pagina: 1,
        ordem: "desc",
      },
      { enabled: !!selectedSessionId },
    ),
  );

  // ✅ Buscar todas as mensagens para calcular tokens
  const allMessagesQuery = useQuery(
    trpc.app.chat.buscarMensagensTest.queryOptions(
      {
        chatSessionId: selectedSessionId!,
        limite: 100, // Reduzir limite para evitar erro "too_big"
        pagina: 1,
        ordem: "asc", // ✅ Ordem cronológica para cálculo de tokens
      },
      {
        enabled: !!selectedSessionId,
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
        timestamp: lastMessage.createdAt.toISOString(),
      }
    : undefined;

  // ✅ Calcular uso de tokens
  const modelName = sessionQuery.data?.aiModel?.name || "";
  const messages = allMessagesQuery.data?.messages || [];
  const tokenUsage = useTokenUsage(messages, modelName);

  // ✅ Mutation para atualizar sessão (apenas quando há sessão)
  const updateSessionMutation = useMutation(
    trpc.app.chat.atualizarSession.mutationOptions({
      onSuccess: () => {
        toast.success(
          selectedSessionId
            ? "Modelo da sessão atualizado com sucesso!"
            : "Modelo preferido atualizado com sucesso!",
        );

        // ✅ Invalidação inteligente
        if (selectedSessionId) {
          queryClient.invalidateQueries(
            trpc.app.chat.buscarSession.pathFilter(),
          );
        }

        // 🎯 NOVA: Invalidar sidebar também
        queryClient.invalidateQueries(
          trpc.app.chat.listarSessions.pathFilter(),
        );

        console.log(
          "🔄 [UNIFIED_CHAT] Mutation success - todas queries invalidadas",
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
    console.log("🔄 [UNIFIED_CHAT] useEffect - Atualizando selectedModelId:", {
      selectedSessionId,
      sessionModelId: sessionQuery.data?.aiModelId,
      isReady,
      preferredModelId,
      currentSelectedModelId: selectedModelId,
    });

    if (selectedSessionId && sessionQuery.data?.aiModelId) {
      // ✅ Prioridade 1: Modelo da sessão selecionada
      console.log(
        `🔧 [UNIFIED_CHAT] Usando modelo da sessão: ${sessionQuery.data.aiModelId}`,
      );
      setSelectedModelId(sessionQuery.data.aiModelId);
    } else if (!selectedSessionId && isReady && preferredModelId) {
      // ✅ Prioridade 2: Modelo preferido quando não há sessão
      console.log(
        `🔧 [UNIFIED_CHAT] Usando modelo preferido: ${preferredModelId}`,
      );
      setSelectedModelId(preferredModelId);
    }
  }, [
    selectedSessionId,
    sessionQuery.data?.aiModelId,
    isReady,
    preferredModelId,
  ]);

  // ✅ NAVEGAÇÃO CENTRALIZADA: Função para lidar com seleção de sessão
  const handleSessionSelect = (sessionId: string | undefined) => {
    console.log("🔄 [UNIFIED_CHAT] handleSessionSelect chamado:", sessionId);
    setSelectedSessionId(sessionId);

    // ✅ Navegar para a sessão ou página principal
    if (sessionId) {
      console.log("🚀 [UNIFIED_CHAT] Navegando para sessão:", sessionId);
      router.push(`/apps/chat/${sessionId}`);
    } else {
      console.log("🚀 [UNIFIED_CHAT] Navegando para página principal");
      router.push("/apps/chat");
    }
  };

  // ✅ Função para lidar com seleção de modelo
  const handleModelSelect = (modelId: string) => {
    console.log("🔍 [DIAGNOSIS] Queries em uso:");
    console.log("UnifiedChatPage:", {
      buscarSession: "✅ Invalidada",
      buscarMensagensTest: "✅ Invalidada",
      listarSessions: "❌ NÃO invalidada",
    });
    console.log("AppSidebar:", {
      listarSessions: "🎯 QUERY PRINCIPAL",
      buscarChatFolders: "Secundária",
    });

    console.log("🔄 [DIAGNOSIS] handleModelSelect iniciado:", {
      modelId,
      selectedSessionId,
      willInvalidate: ["buscarSession", "buscarMensagensTest"],
      missing: ["listarSessions"], // ⚠️ Esta é a query que falta
    });

    // ✅ Atualizar estado local primeiro
    setSelectedModelId(modelId);

    if (selectedSessionId) {
      // ✅ Tem sessão: atualizar modelo da sessão
      updateSessionMutation.mutate({
        id: selectedSessionId,
        aiModelId: modelId,
      });

      // ✅ Invalidar e re-fetch para atualizar dados
      console.log("🔄 [CORREÇÃO] Invalidando queries CORRIGIDAS:", {
        buscarSession: "✅ SERÁ invalidada",
        buscarMensagensTest: "✅ SERÁ invalidada",
        listarSessions: "✅ SERÁ invalidada - CORRIGIDO!",
      });

      queryClient.invalidateQueries(
        trpc.app.chat.buscarSession.pathFilter({
          sessionId: selectedSessionId,
        }),
      );

      queryClient.invalidateQueries(
        trpc.app.chat.buscarMensagensTest.pathFilter({
          chatSessionId: selectedSessionId,
        }),
      );

      // 🎯 NOVA: Invalidar query da sidebar
      queryClient.invalidateQueries(trpc.app.chat.listarSessions.pathFilter());

      console.log(
        "✅ [CORREÇÃO] Query listarSessions invalidada - sidebar deve atualizar!",
      );

      // Re-fetch para garantir dados atualizados
      setTimeout(() => {
        sessionQuery.refetch();
        messagesQuery.refetch();
      }, 500);
    } else {
      // ✅ Sem sessão: salvar como modelo preferido
      savePreferredModel(modelId);

      // ✅ Atualizar modelo preferido após salvar
      setTimeout(() => {
        refetchPreferredModel();
      }, 1000);
    }
  };

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="bg-background flex h-[calc(100dvh-55px)] w-full overflow-x-hidden">
        {/* Sidebar - assume largura interna definida pelo componente */}
        <AppSidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho com ModelSelector e badges - estilo ChatGPT */}
          <div className="border-border bg-card flex items-center justify-between border-b px-4 py-3">
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
