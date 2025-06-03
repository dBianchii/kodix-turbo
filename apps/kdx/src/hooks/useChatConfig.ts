import type { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { chatConfigSchema } from "@kdx/shared";
import { chatAppId } from "@kdx/shared";

import { api } from "~/trpc/react";

type ChatConfig = z.infer<typeof chatConfigSchema>;

export function useChatConfig() {
  const queryClient = useQueryClient();

  console.log("🔧 [useChatConfig] Hook inicializado");

  // Buscar configuração atual do team
  const {
    data: config,
    isLoading,
    error,
  } = api.app.getConfig.useQuery(
    { appId: chatAppId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  );

  console.log("📊 [useChatConfig] Query state:", { config, isLoading, error });

  // Configuração padrão para usar quando não há config
  const defaultConfig: ChatConfig = {
    lastSelectedModelId: undefined,
    aiSettings: {
      maxTokens: 2000,
      temperature: 0.7,
      enableStreaming: true,
    },
    uiSettings: {
      showModelInHeader: true,
      autoSelectModel: true,
      defaultChatTitle: "Nova Conversa",
    },
    behaviorSettings: {
      rememberLastModel: true,
      autoSaveConversations: true,
      enableTypingIndicator: true,
    },
  };

  // Merge configuração carregada com defaults
  const mergedConfig = config ? { ...defaultConfig, ...config } : defaultConfig;

  console.log("🔀 [useChatConfig] Merged config:", mergedConfig);

  // Mutation para salvar configuração
  const saveConfigMutation = api.app.saveConfig.useMutation({
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: [
          ["app", "getConfig"],
          { input: { appId: chatAppId }, type: "query" },
        ],
      });
      console.log("✅ [useChatConfig] Chat config saved successfully", data);
      toast.success("Configuração salva com sucesso!");
    },
    onError: (error: any) => {
      console.error("❌ [useChatConfig] Error saving chat config:", error);
      console.error("❌ [useChatConfig] Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        shape: error.shape,
      });
      toast.error(
        `Erro ao salvar configurações: ${error.message || "Erro desconhecido"}`,
      );
    },
  });

  // Função para salvar configuração completa
  const saveConfig = (newConfig: Partial<ChatConfig>) => {
    console.log("💾 [useChatConfig] saveConfig called with:", newConfig);
    console.log("💾 [useChatConfig] Current config from server:", config);
    console.log("💾 [useChatConfig] Current mergedConfig:", mergedConfig);

    // Se não há config existente, criar um novo com apenas as propriedades necessárias
    let configToSave: ChatConfig;

    if (!config) {
      console.log("💾 [useChatConfig] No existing config, creating new one");
      configToSave = {
        lastSelectedModelId: newConfig.lastSelectedModelId,
        aiSettings: newConfig.aiSettings || defaultConfig.aiSettings,
        uiSettings: newConfig.uiSettings || defaultConfig.uiSettings,
        behaviorSettings:
          newConfig.behaviorSettings || defaultConfig.behaviorSettings,
      };
    } else {
      console.log("💾 [useChatConfig] Merging with existing config");
      configToSave = {
        aiSettings: defaultConfig.aiSettings,
        uiSettings: defaultConfig.uiSettings,
        behaviorSettings: defaultConfig.behaviorSettings,
        ...config,
        ...newConfig,
      };
    }

    console.log("💾 [useChatConfig] Final config to save:", configToSave);

    saveConfigMutation.mutate({
      appId: chatAppId,
      config: configToSave,
    });
  };

  // Função específica para salvar o último modelo selecionado
  const saveLastSelectedModel = (modelId: string) => {
    console.log(
      "🔍 [useChatConfig] saveLastSelectedModel called with:",
      modelId,
    );
    console.log(
      "🔍 [useChatConfig] rememberLastModel setting:",
      mergedConfig.behaviorSettings.rememberLastModel,
    );

    if (!mergedConfig.behaviorSettings.rememberLastModel) {
      console.log(
        "⚠️ [useChatConfig] rememberLastModel is disabled, not saving",
      );
      return; // Não salvar se a opção estiver desabilitada
    }

    console.log("💾 [useChatConfig] Saving last selected model:", modelId);
    saveConfig({
      lastSelectedModelId: modelId,
    });
  };

  // Função para obter o modelo padrão do team
  const getDefaultModelId = () => {
    const result = mergedConfig.lastSelectedModelId;
    console.log("🔍 [useChatConfig] getDefaultModelId returning:", result);
    return result;
  };

  // Função para verificar se deve auto-selecionar modelo
  const shouldAutoSelectModel = () => {
    const result = mergedConfig.uiSettings.autoSelectModel !== false;
    console.log("🔍 [useChatConfig] shouldAutoSelectModel returning:", result);
    return result;
  };

  return {
    // Dados
    config: mergedConfig,
    isLoading,

    // Estado de loading
    isSaving: saveConfigMutation.isPending,

    // Funções principais
    saveConfig,
    saveLastSelectedModel,
    getDefaultModelId,
    shouldAutoSelectModel,

    // Configurações específicas (helpers)
    showModelInHeader: mergedConfig.uiSettings.showModelInHeader !== false,
    rememberLastModel:
      mergedConfig.behaviorSettings.rememberLastModel !== false,
    enableStreaming: mergedConfig.aiSettings.enableStreaming !== false,
    defaultChatTitle:
      mergedConfig.uiSettings.defaultChatTitle || "Nova Conversa",
  };
}
