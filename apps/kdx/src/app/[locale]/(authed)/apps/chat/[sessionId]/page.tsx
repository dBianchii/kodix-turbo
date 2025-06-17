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
import { useChatPreferredModel } from "../_hooks/useChatPreferredModel";

export default function ChatSessionPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
        console.log("✅ [CHAT] Modelo da sessão confirmado no servidor");
      },
      onError: trpcErrorToastDefault,
    }),
  );

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

    console.log(
      `🔄 [CHAT] Atualizando modelo da sessão ${sessionId}: ${previousModelId} → ${modelId}`,
    );
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
            <h1 className="text-lg font-medium">{t("apps.chat.appName")}</h1>
            <div className="flex items-center gap-2">
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
