import type { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { chatUserAppTeamConfigSchema } from "@kdx/shared";
import { chatAppId } from "@kdx/shared";

import { useTRPC } from "~/trpc/react";

type ChatUserConfig = z.infer<typeof chatUserAppTeamConfigSchema>;

/**
 * Hook para gerenciar configurações PESSOAIS do usuário no chat
 * ✅ CORRIGIDO: Agora usa escopo de USUÁRIO, não team
 *
 * Configurações incluem:
 * - Modelo preferido pessoal
 * - Configurações de IA (tokens, temperatura, streaming)
 * - Preferências de UI (tema, fonte, modo compacto)
 * - Comportamentos pessoais
 */
export function useChatUserConfig() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  console.log("🔧 [useChatUserConfig] Hook inicializado - Escopo USUÁRIO");

  // ✅ Buscar configuração atual do USUÁRIO (não team)
  const {
    data: rawConfig,
    isLoading,
    error,
  } = useQuery(
    trpc.app.getUserAppTeamConfig.queryOptions(
      { appId: chatAppId },
      {
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
      },
    ),
  );

  // ✅ CORREÇÃO: Cast para o tipo correto do chat
  const config = rawConfig as ChatUserConfig | undefined;

  console.log("📊 [useChatUserConfig] User config state:", {
    config,
    isLoading,
    error,
  });

  // Configuração padrão para usar quando não há config
  const defaultConfig: ChatUserConfig = {
    personalSettings: {
      preferredModelId: undefined,
      enableNotifications: true,
      notificationSound: false,
      rememberLastModel: true,
    },
    aiSettings: {
      maxTokens: 2000,
      temperature: 0.7,
      enableStreaming: true,
    },
    uiPreferences: {
      chatTheme: "auto",
      fontSize: "medium",
      compactMode: false,
      showModelInHeader: true,
      autoSelectModel: true,
      defaultChatTitle: "Nova Conversa",
    },
    behaviorSettings: {
      autoSaveConversations: true,
      enableTypingIndicator: true,
    },
  };

  // Merge configuração carregada com defaults
  const mergedConfig = config ? { ...defaultConfig, ...config } : defaultConfig;

  console.log("🔀 [useChatUserConfig] Merged user config:", mergedConfig);

  // ✅ Mutation para salvar configuração de USUÁRIO
  const saveConfigMutation = useMutation(
    trpc.app.saveUserAppTeamConfig.mutationOptions({
      onSuccess: (data: any) => {
        queryClient.invalidateQueries(
          trpc.app.getUserAppTeamConfig.pathFilter(),
        );
        console.log(
          "✅ [useChatUserConfig] User config saved successfully",
          data,
        );
        toast.success("Configurações pessoais salvas!");
      },
      onError: (error: any) => {
        console.error(
          "❌ [useChatUserConfig] Error saving user config:",
          error,
        );
        console.error("❌ [useChatUserConfig] Error details:", {
          message: error.message,
          code: error.code,
          data: error.data,
          shape: error.shape,
        });
        toast.error(
          `Erro ao salvar configurações: ${error.message || "Erro desconhecido"}`,
        );
      },
    }),
  );

  // Função para salvar configuração completa
  const saveConfig = (newConfig: Partial<ChatUserConfig>) => {
    console.log("💾 [useChatUserConfig] saveConfig called with:", newConfig);
    console.log("💾 [useChatUserConfig] Current config from server:", config);

    // Merge inteligente preservando estrutura aninhada
    const configToSave: ChatUserConfig = {
      personalSettings: {
        ...defaultConfig.personalSettings,
        ...config?.personalSettings,
        ...newConfig.personalSettings,
      },
      aiSettings: {
        ...defaultConfig.aiSettings,
        ...config?.aiSettings,
        ...newConfig.aiSettings,
      },
      uiPreferences: {
        ...defaultConfig.uiPreferences,
        ...config?.uiPreferences,
        ...newConfig.uiPreferences,
      },
      behaviorSettings: {
        ...defaultConfig.behaviorSettings,
        ...config?.behaviorSettings,
        ...newConfig.behaviorSettings,
      },
    };

    console.log("💾 [useChatUserConfig] Final config to save:", configToSave);

    saveConfigMutation.mutate({
      appId: chatAppId,
      config: configToSave,
    });
  };

  // ✅ Função específica para salvar o modelo preferido do USUÁRIO
  const savePreferredModel = async (modelId: string) => {
    console.log("🔄 [useChatUserConfig] savePreferredModel INICIADO:", {
      modelId,
      currentConfig: config,
      hasConfig: !!config,
    });

    const newConfig = {
      ...config,
      personalSettings: {
        enableNotifications: true,
        notificationSound: false,
        rememberLastModel: true,
        ...config?.personalSettings,
        preferredModelId: modelId,
      },
    };

    console.log("💾 [useChatUserConfig] Configuração a ser salva:", newConfig);

    const result = await saveConfig(newConfig);

    console.log("✅ [useChatUserConfig] savePreferredModel FINALIZADO:", {
      modelId,
      success: result !== null && result !== undefined,
      savedConfig: newConfig,
    });

    return result;
  };

  // ✅ Função para obter o modelo preferido do USUÁRIO
  const getPreferredModelId = () => {
    const result = mergedConfig.personalSettings.preferredModelId;
    console.log(
      "🔍 [useChatUserConfig] getPreferredModelId returning:",
      result,
    );
    return result;
  };

  // Função para verificar se deve auto-selecionar modelo
  const shouldAutoSelectModel = () => {
    const result = mergedConfig.uiPreferences.autoSelectModel !== false;
    console.log(
      "🔍 [useChatUserConfig] shouldAutoSelectModel returning:",
      result,
    );
    return result;
  };

  return {
    // Dados
    config: mergedConfig,
    isLoading,
    error,

    // Estado de loading
    isSaving: saveConfigMutation.isPending,

    // ✅ Funções principais para configurações PESSOAIS
    saveConfig,
    savePreferredModel, // Era saveLastSelectedModel, agora com nome mais claro
    getPreferredModelId, // Era getDefaultModelId, agora com nome mais claro
    shouldAutoSelectModel,

    // Configurações específicas (helpers)
    showModelInHeader: mergedConfig.uiPreferences.showModelInHeader !== false,
    rememberLastModel:
      mergedConfig.personalSettings.rememberLastModel !== false,
    enableStreaming: mergedConfig.aiSettings.enableStreaming !== false,
    defaultChatTitle:
      mergedConfig.uiPreferences.defaultChatTitle || "Nova Conversa",
    chatTheme: mergedConfig.uiPreferences.chatTheme,
    fontSize: mergedConfig.uiPreferences.fontSize,
    compactMode: mergedConfig.uiPreferences.compactMode,

    // Configurações de IA
    maxTokens: mergedConfig.aiSettings.maxTokens,
    temperature: mergedConfig.aiSettings.temperature,

    // Configurações de comportamento
    enableNotifications: mergedConfig.personalSettings.enableNotifications,
    notificationSound: mergedConfig.personalSettings.notificationSound,
    autoSaveConversations: mergedConfig.behaviorSettings.autoSaveConversations,
    enableTypingIndicator: mergedConfig.behaviorSettings.enableTypingIndicator,
  };
}
