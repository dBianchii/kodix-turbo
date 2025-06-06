"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { toast } from "@kdx/ui/toast";

import { useChatConfig } from "~/hooks/useChatConfig";
import { api } from "~/trpc/react";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatWindow } from "./_components/chat-window";
import { ModelInfoBadge } from "./_components/model-info-badge";
import { ModelSelector } from "./_components/model-selector";
import { QuickChatInput } from "./_components/quick-chat-input";
import { useChatPreferredModel } from "./_hooks/useChatPreferredModel";

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

  // ✅ Hook para gerenciar configurações do Chat no team
  const { saveLastSelectedModel, isSaving, config } = useChatConfig();

  // ✅ Debug logs do useChatConfig
  useEffect(() => {
    console.log("🔧 [CHAT] Estado do useChatConfig:", {
      isSaving,
      config,
      lastSelectedModelId: config.lastSelectedModelId,
      hasConfig: !!config,
    });
  }, [isSaving, config]);

  // ✅ Carregar modelo preferido (para quando não há sessão selecionada)
  const {
    modelId: preferredModelId,
    isReady,
    isLoading,
    error: preferredError,
    refetch: refetchPreferredModel,
  } = useChatPreferredModel();

  // ✅ Debug logs
  useEffect(() => {
    console.log("🔧 [CHAT] Estado do modelo preferido:", {
      preferredModelId,
      isReady,
      isLoading,
      error: preferredError,
      selectedSessionId,
      configLastSelected: config.lastSelectedModelId,
      shouldUseConfig: !selectedSessionId && config.lastSelectedModelId,
    });
  }, [
    preferredModelId,
    isReady,
    isLoading,
    preferredError,
    selectedSessionId,
    config.lastSelectedModelId,
  ]);

  // ✅ Buscar dados da sessão para obter o modelo da sessão selecionada
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const sessionQuery = api.app.chat.buscarSession.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId },
  );

  // ✅ TEMPORARIAMENTE COMENTADO - Buscar última mensagem para obter metadata do modelo real usado (só quando há sessão)
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  // const messagesQuery = api.app.chat.buscarMensagensTest.useQuery(
  //   { chatSessionId: selectedSessionId!, limite: 1, pagina: 1 },
  //   { enabled: !!selectedSessionId },
  // );

  // ✅ TEMPORARIAMENTE COMENTADO - Extrair metadata da última mensagem
  // const lastMessage = messagesQuery.data?.mensagens?.[0];
  // const lastMessageMetadata = lastMessage?.metadata ? {
  //   actualModelUsed: lastMessage.metadata.model,
  //   requestedModel: lastMessage.metadata.requestedModel || lastMessage.metadata.model,
  //   providerId: lastMessage.metadata.providerId,
  //   timestamp: lastMessage.createdAt,
  // } : undefined;
  const lastMessageMetadata = undefined;

  // ✅ Mutation para atualizar modelo da sessão (quando há sessão selecionada)
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const updateSessionMutation = api.app.chat.atualizarSession.useMutation({
    onSuccess: () => {
      toast.success("Modelo da sessão atualizado com sucesso!");
      // Invalidar queries para atualizar dados
      sessionQuery.refetch();
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
    setSelectedSessionId(sessionId);
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

    if (selectedSessionId) {
      // ✅ Atualizar modelo da sessão atual no banco
      updateSessionMutation.mutate({
        id: selectedSessionId,
        aiModelId: modelId,
      });
      console.log(
        `🔄 [CHAT] Atualizando modelo da sessão ${selectedSessionId}: ${previousModelId} → ${modelId}`,
      );
    } else {
      // ✅ Salvar modelo como preferido no team config
      console.log(
        `🔄 [CHAT] Salvando modelo preferido no team config: ${previousModelId} → ${modelId}`,
      );
      console.log("🔄 [CHAT] Chamando saveLastSelectedModel...");

      saveLastSelectedModel(modelId);

      console.log("🔄 [CHAT] saveLastSelectedModel foi chamado!");

      // ✅ Forçar atualização do modelo preferido após salvar
      setTimeout(() => {
        console.log("🔄 [CHAT] Refazendo fetch do modelo preferido...");
        refetchPreferredModel();
      }, 1000);
    }
  };

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-[#121212] text-white">
        {/* Sidebar ‑– assume largura interna definida pelo componente */}
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
                disabled={
                  (selectedSessionId
                    ? updateSessionMutation.isPending
                    : isSaving) ||
                  (!selectedSessionId && isLoading)
                }
              />
            </div>
            <h1 className="text-lg font-medium">
              {selectedSessionId
                ? t("apps.chat.appName")
                : t("apps.chat.welcome-chat")}
            </h1>
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
          <div className="relative flex-1 p-4">
            {selectedSessionId ? (
              <ChatWindow sessionId={selectedSessionId} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <QuickChatInput onSessionCreated={handleSessionSelect} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
