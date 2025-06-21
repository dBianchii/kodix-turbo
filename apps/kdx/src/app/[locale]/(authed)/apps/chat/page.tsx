/**
 * 💬 CHAT SUBAPP - Página Principal
 *
 * 📚 DOCUMENTAÇÃO:
 * - Arquitetura SubApp: @docs/architecture/subapp-architecture.md
 * - Chat Overview: @docs/subapps/chat/README.md
 * - Chat Features: @docs/subapps/chat/Chat_Session_Edit_Feature.md
 * - Team Config: @docs/subapps/chat/Chat_Team_Config_System.md
 * - Preferred Model: @docs/subapps/chat/Chat_Preferred_Model_Endpoint.md
 * - Streaming: @docs/subapps/chat/Chat_Streaming_Implementation.md
 *
 * 🔗 SUBPASTA DOCUMENTAÇÃO: docs/subapps/chat/
 *
 * 🎯 FUNCIONALIDADES:
 * - Conversas em tempo real com streaming
 * - Sessões persistentes com histórico
 * - Múltiplos provedores de IA (OpenAI, Anthropic, Google, etc.)
 * - Edição de mensagens
 * - Configurações por team com modelo padrão persistente
 * - Interface responsiva estilo ChatGPT
 */

// @ts-nocheck - Chat tRPC router has type definition issues that need to be resolved at the router level
"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { toast } from "@kdx/ui/toast";

import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { useRouter } from "~/i18n/routing";
import { useTRPC } from "~/trpc/react";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatWindow } from "./_components/chat-window";
import { ModelInfoBadge } from "./_components/model-info-badge";
import { ModelSelector } from "./_components/model-selector";
import { TokenUsageBadge } from "./_components/token-usage-badge";
import { useChatPreferredModel } from "./_hooks/useChatPreferredModel";
import { useChatUserConfig } from "./_hooks/useChatUserConfig";
import { useTokenUsage } from "./_hooks/useTokenUsage";

{
  /*
  import { H1 } from "@kdx/ui/typography"; 
  import { Separator } from "@kdx/ui/separator";
  */
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId?: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, sessionId } = resolvedParams;
  const router = useRouter();
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(sessionId);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );

  // ✅ Hook para gerenciar configurações PESSOAIS do usuário (não team)
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

  // 🔍 DEBUG: Teste manual de cálculo de tokens
  const testTokens = messages.reduce((total, msg) => {
    return total + Math.ceil((msg.content || "").length / 4);
  }, 0);

  const tokenUsage = useTokenUsage(messages, modelName);

  // 🔍 DEBUG: Log para verificar dados
  console.log("🔍 [TOKEN_DEBUG] Dados para cálculo de tokens:", {
    selectedSessionId,
    modelName,
    messagesCount: messages.length,
    allMessagesLoading: allMessagesQuery.isLoading,
    allMessagesError: allMessagesQuery.error,
    testTokensManual: testTokens,
    tokenUsage,
    rawMessages: messages,
    messagesPreview: messages.map((m) => ({
      role: m.senderRole,
      contentLength: m.content?.length || 0,
      contentPreview: (m.content || "").substring(0, 50) + "...",
    })),
  });

  // ✅ Mutation para atualizar sessão
  const updateSessionMutation = useMutation(
    trpc.app.chat.atualizarSession.mutationOptions({
      onSuccess: () => {
        toast.success("Modelo da sessão atualizado com sucesso!");

        // ✅ CORREÇÃO: Invalidação inteligente com delay
        // Invalidar sessão imediatamente (não afeta mensagens)
        queryClient.invalidateQueries(trpc.app.chat.buscarSession.pathFilter());

        // ✅ SOLUÇÃO: NÃO invalidar mensagens para evitar conflito com streaming
        // A invalidação de sessão é suficiente para outras funcionalidades
        console.log(
          "🔄 [CHAT] Sessão invalidada - mensagens mantidas pelo useChat",
        );
      },
      onError: trpcErrorToastDefault,
    }),
  );

  // Atualizar modelo selecionado baseado na sessão ou modelo preferido
  useEffect(() => {
    console.log("🔄 [CHAT] useEffect - Atualizando selectedModelId:", {
      selectedSessionId,
      sessionModelId: sessionQuery.data?.aiModelId,
      isReady,
      preferredModelId,
      currentSelectedModelId: selectedModelId,
    });

    if (selectedSessionId && sessionQuery.data?.aiModelId) {
      // ✅ Prioridade 1: Modelo da sessão selecionada
      console.log(
        `🔧 [CHAT] Usando modelo da sessão: ${sessionQuery.data.aiModelId}`,
      );
      setSelectedModelId(sessionQuery.data.aiModelId);
    } else if (!selectedSessionId && isReady && preferredModelId) {
      // ✅ Prioridade 2: Modelo preferido quando não há sessão
      console.log(`🔧 [CHAT] Usando modelo preferido: ${preferredModelId}`);
      setSelectedModelId(preferredModelId);
    }
  }, [
    selectedSessionId,
    sessionQuery.data?.aiModelId,
    isReady,
    preferredModelId,
  ]);

  // ✅ Monitor mudanças no selectedModelId
  useEffect(() => {
    console.log("🎯 [CHAT] selectedModelId atualizado:", selectedModelId);
  }, [selectedModelId]);

  // ✅ THREAD-FIRST: Função para lidar com nova sessão criada
  const handleSessionSelect = (sessionId: string | undefined) => {
    console.log("🔄 [CHAT] handleSessionSelect chamado:", sessionId);
    setSelectedSessionId(sessionId);

    // ✅ THREAD-FIRST: Navegar para a sessão criada
    if (sessionId) {
      console.log("🚀 [CHAT] Navegando para sessão:", sessionId);
      router.push(`/apps/chat/${sessionId}`);
    }
  };

  // ✅ THREAD-FIRST: Sincronizar sessionId da URL com estado local
  useEffect(() => {
    if (sessionId !== selectedSessionId) {
      setSelectedSessionId(sessionId);
    }
  }, [sessionId, selectedSessionId]);

  const handleModelSelect = (modelId: string) => {
    const previousModelId = selectedModelId;
    setSelectedModelId(modelId);

    console.log("🔄 [CHAT] handleModelSelect chamado:", {
      modelId,
      previousModelId,
      selectedSessionId,
      hasSession: !!selectedSessionId,
    });

    // ✅ SEMPRE salvar modelo como preferido no team config - PRIMEIRO
    console.log(
      `🔄 [CHAT] Salvando modelo preferido nas configurações do usuário: ${previousModelId} → ${modelId}`,
    );
    console.log("🔄 [CHAT] Chamando savePreferredModel...");

    savePreferredModel(modelId);

    console.log("🔄 [CHAT] savePreferredModel foi chamado!");

    // ✅ DEPOIS atualizar a sessão se existir
    if (selectedSessionId) {
      console.log(
        "📝 [CHAT] Sessão selecionada - atualizando modelo da sessão...",
      );
      console.log("📝 [CHAT] Mutation payload:", {
        id: selectedSessionId,
        aiModelId: modelId,
      });

      updateSessionMutation.mutate({
        id: selectedSessionId,
        aiModelId: modelId,
      });

      console.log(
        `🔄 [CHAT] updateSessionMutation.mutate() chamado para sessão ${selectedSessionId}: ${previousModelId} → ${modelId}`,
      );
      console.log("📊 [CHAT] updateSessionMutation status:", {
        isPending: updateSessionMutation.isPending,
        isError: updateSessionMutation.isError,
        error: updateSessionMutation.error,
        isSuccess: updateSessionMutation.isSuccess,
      });
    } else {
      console.log(
        "ℹ️ [CHAT] Nenhuma sessão selecionada - apenas salvando modelo preferido",
      );
    }

    // ✅ Forçar atualização do modelo preferido após salvar
    setTimeout(() => {
      console.log("🔄 [CHAT] Refazendo fetch do modelo preferido...");
      refetchPreferredModel();
    }, 1000);
  };

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="bg-background flex h-[calc(100dvh-55px)] w-full overflow-x-hidden">
        {/* Sidebar ‑– assume largura interna definida pelo componente */}
        <AppSidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho com ModelSelector e ModelInfoBadge - estilo ChatGPT */}
          <div className="border-border bg-card flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelSelect={handleModelSelect}
                disabled={
                  (selectedSessionId
                    ? updateSessionMutation.isPending
                    : isSaving) ||
                  (!selectedSessionId && isLoading)
                }
              />
            </div>
            {/* Espaço vazio para remover o título "Chat" */}
            <div></div>
            <div className="flex items-center gap-2">
              {selectedSessionId &&
                sessionQuery.data &&
                tokenUsage.maxTokens > 0 && (
                  <TokenUsageBadge
                    usedTokens={tokenUsage.usedTokens}
                    maxTokens={tokenUsage.maxTokens}
                  />
                )}
              {selectedSessionId && sessionQuery.data && (
                <ModelInfoBadge
                  sessionData={sessionQuery.data}
                  lastMessageMetadata={lastMessageMetadata}
                />
              )}
            </div>
          </div>

          {/* <H1>{t("Chat")}</H1>
          <Separator className="my-4" />
          */}

          {/* Área do chat cresce para preencher o espaço restante */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatWindow
              sessionId={selectedSessionId}
              onNewSession={handleSessionSelect}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
