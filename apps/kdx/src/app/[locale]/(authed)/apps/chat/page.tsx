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

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatWindow } from "./_components/chat-window";
import { ModelInfoBadge } from "./_components/model-info-badge";
import { ModelSelector } from "./_components/model-selector";
import { useChatPreferredModel } from "./_hooks/useChatPreferredModel";
import { useChatUserConfig } from "./_hooks/useChatUserConfig";

{
  /*
  import { H1 } from "@kdx/ui/typography"; 
  import { Separator } from "@kdx/ui/separator";
  */
}

export default function ChatPage() {
  const t = useTranslations();
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(undefined);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );

  // ✅ CORRIGIDO: Hook para gerenciar configurações PESSOAIS do usuário (não team)
  const { savePreferredModel, isSaving, config } = useChatUserConfig();

  // ✅ Carregar modelo preferido (para quando não há sessão selecionada)
  const {
    modelId: preferredModelId,
    isReady,
    isLoading,
    error: preferredError,
    refetch: refetchPreferredModel,
  } = useChatPreferredModel();

  // ✅ Buscar dados da sessão para obter o modelo da sessão selecionada
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const sessionQuery = api.app.chat.buscarSession.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId },
  );

  // ✅ Buscar última mensagem para obter metadata do modelo real usado (só quando há sessão)
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const messagesQuery = api.app.chat.buscarMensagensTest.useQuery(
    {
      chatSessionId: selectedSessionId!,
      limite: 1,
      pagina: 1,
      ordem: "desc", // ✅ Buscar mensagem mais recente primeiro
    },
    { enabled: !!selectedSessionId },
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

  // ✅ Mutation para atualizar modelo da sessão (quando há sessão selecionada)
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const updateSessionMutation = api.app.chat.atualizarSession.useMutation({
    onSuccess: () => {
      toast.success("Modelo da sessão atualizado com sucesso!");
      // Invalidar queries para atualizar dados
      sessionQuery.refetch();
      messagesQuery.refetch(); // ✅ Também refazer busca de mensagens
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar modelo: " + error.message);
      console.error("❌ [CHAT] Erro ao atualizar modelo da sessão:", error);
    },
  });

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

  const handleSessionSelect = (sessionId: string | undefined) => {
    console.log("🔄 [CHAT] handleSessionSelect chamado:", sessionId);
    setSelectedSessionId(sessionId);

    // ✅ Se é uma nova sessão criada, processar primeira resposta da IA
    if (sessionId) {
      console.log(
        "🤖 [CHAT] Nova sessão criada, processando primeira resposta da IA...",
      );
      // A resposta da IA será processada pelo ChatWindow via streaming
    }
  };

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
            <div className="flex items-center gap-2">
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
          <div className="relative flex-1">
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
