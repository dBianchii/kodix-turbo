"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@kdx/ui/resizable";
import { toast } from "@kdx/ui/toast";

import { api } from "~/trpc/react";
import { useChatPreferredModel } from "../../_hooks/useChatPreferredModel";
import { useChatUserConfig } from "../../_hooks/useChatUserConfig";
import { ChatV3Ready } from "./chat-v3-ready";
import { ChatV3Sidebar } from "./chat-v3-sidebar";
import { ChatV3Simple } from "./chat-v3-simple";
import { ModelSelectorV3 } from "./model-selector-v3";

export function ChatV3Container() {
  const t = useTranslations();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
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

  // ✅ Buscar dados da sessão para obter o modelo da sessão selecionada
  // @ts-ignore - Ignorando temporariamente erro de TypeScript do tRPC
  const sessionQuery = api.app.chat.buscarSession.useQuery(
    { sessionId: currentSessionId! },
    { enabled: !!currentSessionId },
  );

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
      console.error("❌ [CHAT V3] Erro ao atualizar modelo da sessão:", error);
    },
  });

  // Atualizar modelo selecionado baseado na sessão ou modelo preferido
  useEffect(() => {
    console.log("🔄 [CHAT V3] useEffect - Atualizando selectedModelId:", {
      currentSessionId,
      sessionModelId: sessionQuery.data?.aiModelId,
      isReady,
      preferredModelId,
      currentSelectedModelId: selectedModelId,
    });

    if (currentSessionId && sessionQuery.data?.aiModelId) {
      // ✅ Prioridade 1: Modelo da sessão selecionada
      console.log(
        `🔧 [CHAT V3] Usando modelo da sessão: ${sessionQuery.data.aiModelId}`,
      );
      setSelectedModelId(sessionQuery.data.aiModelId);
    } else if (!currentSessionId && isReady && preferredModelId) {
      // ✅ Prioridade 2: Modelo preferido quando não há sessão
      console.log(`🔧 [CHAT V3] Usando modelo preferido: ${preferredModelId}`);
      setSelectedModelId(preferredModelId);
    }
  }, [
    currentSessionId,
    sessionQuery.data?.aiModelId,
    isReady,
    preferredModelId,
  ]);

  // ✅ Monitor mudanças no selectedModelId
  useEffect(() => {
    console.log("🎯 [CHAT V3] selectedModelId atualizado:", selectedModelId);
  }, [selectedModelId]);

  const handleModelSelect = (modelId: string) => {
    const previousModelId = selectedModelId;
    setSelectedModelId(modelId);

    console.log("🔄 [CHAT V3] handleModelSelect chamado:", {
      modelId,
      previousModelId,
      currentSessionId,
      hasSession: !!currentSessionId,
    });

    // ✅ SEMPRE salvar modelo como preferido no team config - PRIMEIRO
    console.log(
      `🔄 [CHAT V3] Salvando modelo preferido nas configurações do usuário: ${previousModelId} → ${modelId}`,
    );
    savePreferredModel(modelId);

    // ✅ DEPOIS atualizar a sessão se existir
    if (currentSessionId) {
      console.log(
        "📝 [CHAT V3] Sessão selecionada - atualizando modelo da sessão...",
      );
      updateSessionMutation.mutate({
        id: currentSessionId,
        aiModelId: modelId,
      });
    } else {
      console.log(
        "ℹ️ [CHAT V3] Nenhuma sessão selecionada - apenas salvando modelo preferido",
      );
    }

    // ✅ Forçar atualização do modelo preferido após salvar
    setTimeout(() => {
      console.log("🔄 [CHAT V3] Refazendo fetch do modelo preferido...");
      refetchPreferredModel();
    }, 1000);
  };

  // Função simples para criar nova sessão via sidebar
  const handleCreateDemoSession = () => {
    console.log("Criando nova thread via sidebar...");
    setCurrentSessionId(null); // Reset para mostrar tela inicial
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      {/* Sidebar Panel - Redimensionável */}
      <ResizablePanel
        defaultSize={25}
        minSize={20}
        maxSize={40}
        className="min-w-[280px]"
      >
        <div className="h-full">
          <ChatV3Sidebar
            selectedSessionId={currentSessionId || undefined}
            onSessionSelect={(sessionId) =>
              setCurrentSessionId(sessionId || null)
            }
            onNewThread={handleCreateDemoSession}
          />
        </div>
      </ResizablePanel>

      {/* Handle para redimensionar */}
      <ResizableHandle withHandle />

      {/* Main Content Panel - Redimensionável */}
      <ResizablePanel defaultSize={75} minSize={60}>
        <div className="flex h-full flex-col">
          {/* Header com ModelSelector - similar ao assistant-ui.com */}
          <div className="bg-background flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-4">
              <ModelSelectorV3
                selectedModelId={selectedModelId}
                onModelSelect={handleModelSelect}
                disabled={
                  (currentSessionId
                    ? updateSessionMutation.isPending
                    : isSaving) ||
                  (!currentSessionId && isLoading)
                }
                variant="compact"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Espaço para futuras funcionalidades como configurações */}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
            <ChatV3Ready
              sessionId={currentSessionId}
              onNewSession={(sessionId: string) =>
                setCurrentSessionId(sessionId)
              }
              selectedModelId={selectedModelId}
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
