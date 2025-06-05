"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import { SidebarProvider, SidebarTrigger } from "@kdx/ui/sidebar";
import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";
import { AppSidebar } from "../_components/app-sidebar";
import { ChatWindow } from "../_components/chat-window";
import { ModelInfoBadge } from "../_components/model-info-badge";
import { ModelSelector } from "../_components/model-selector";
import { useChatPreferredModel } from "../_hooks/useChatPreferredModel";

export default function ChatSessionPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessionId);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    undefined,
  );

  // ✅ Carregar modelo preferido como fallback
  const { modelId: preferredModelId, isReady } = useChatPreferredModel();

  // ✅ Buscar dados da sessão para obter o modelo da sessão
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const sessionQuery = api.app.chat.buscarSession.useQuery(
    { sessionId },
    { enabled: !!sessionId },
  );

  // ✅ Buscar última mensagem para obter metadata do modelo real usado
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const messagesQuery = api.app.chat.buscarMensagensTest.useQuery(
    {
      chatSessionId: sessionId,
      limite: 1,
      pagina: 1,
      ordem: "desc", // ✅ Buscar mensagem mais recente primeiro
    },
    { enabled: !!sessionId },
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

  // ✅ Mutation para atualizar modelo da sessão
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const updateSessionMutation = api.app.chat.atualizarSession.useMutation({
    onSuccess: () => {
      toast.success("Modelo atualizado com sucesso!");
      // ✅ Invalidar queries para atualizar dados
      sessionQuery.refetch();
      messagesQuery.refetch(); // ✅ Também refazer busca de mensagens
      console.log("✅ [CHAT] Modelo da sessão confirmado no servidor");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar modelo: " + error.message);
      console.error("❌ [CHAT] Erro ao atualizar modelo da sessão:", error);
    },
  });

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
      // Navegar para a nova sessão usando router na v2
      router.push(`/apps/chat/v2/${newSessionId}`);
    } else {
      // ✅ Navegar para a página principal da v2 quando for "Novo Chat"
      router.push("/apps/chat/v2");
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

    console.log(
      `🔄 [CHAT] Atualizando modelo da sessão ${sessionId}: ${previousModelId} → ${modelId}`,
    );
  };

  return (
    <SidebarProvider className="min-h-[calc(100dvh-55px)] items-start">
      <div className="flex h-[calc(100dvh-55px)] w-full overflow-x-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        {/* Sidebar */}
        <AppSidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
        />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho com ModelSelector e ModelInfoBadge - estilo ChatGPT */}
          <div className="flex items-center justify-between border-b border-blue-700/50 bg-slate-800/50 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelSelect={handleModelSelect}
                disabled={updateSessionMutation.isPending}
              />
            </div>
            <h1 className="text-lg font-medium">
              {t("apps.chat.appName")}{" "}
              <span className="text-sm text-blue-400">v2</span>
            </h1>
            <div className="flex items-center gap-2">
              <Link href={`/apps/chat/${sessionId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 bg-gray-600 text-xs text-white hover:bg-gray-700"
                >
                  Back to v1
                </Button>
              </Link>
              {sessionQuery.data && (
                <ModelInfoBadge
                  sessionData={sessionQuery.data}
                  lastMessageMetadata={lastMessageMetadata}
                />
              )}
            </div>
          </div>

          {/* Área do chat */}
          <div className="relative flex-1 p-4">
            <ChatWindow sessionId={selectedSessionId} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
