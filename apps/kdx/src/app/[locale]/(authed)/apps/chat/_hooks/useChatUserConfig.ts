import type { z } from "zod";
import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { chatUserAppTeamConfigSchema } from "@kdx/shared";
import { chatAppId } from "@kdx/shared";

import { useTRPC } from "~/trpc/react";

type ChatUserConfig = z.infer<typeof chatUserAppTeamConfigSchema>;

/**
 * Hook para gerenciar configurações PESSOAIS do usuário no chat
 * ✅ OTIMIZADO: Memoização agressiva para reduzir re-renders
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

  // Hook initialization without verbose logging

  // ✅ Buscar configuração atual do USUÁRIO (não team)
  const {
    data: rawConfig,
    isLoading,
    error,
  } = useQuery(
    trpc.app.getUserAppTeamConfig.queryOptions(
      { appId: chatAppId },
      {
        staleTime: 10 * 60 * 1000, // ✅ OTIMIZAÇÃO: 10 minutos para reduzir requests
        gcTime: 15 * 60 * 1000, // 15 minutos
        refetchOnWindowFocus: false,
        refetchOnMount: false, // ✅ OTIMIZAÇÃO: Não refetch ao montar se já tem dados
      },
    ),
  );

  // ✅ CORREÇÃO: Cast para o tipo correto do chat
  const config = rawConfig as ChatUserConfig | undefined;

  // ✅ OTIMIZAÇÃO: Memoizar configuração padrão para evitar re-criação
  const defaultConfig: ChatUserConfig = useMemo(
    () => ({
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
    }),
    [],
  );

  // ✅ OTIMIZAÇÃO: Memoizar merge para evitar re-cálculo desnecessário
  const mergedConfig = useMemo(() => {
    const result = config ? { ...defaultConfig, ...config } : defaultConfig;
    return result;
  }, [config, defaultConfig]);

  // ✅ OTIMIZAÇÃO: Memoizar mutation options para evitar re-criação
  const mutationOptions = useMemo(
    () => ({
      onSuccess: (data: any) => {
        queryClient.invalidateQueries(
          trpc.app.getUserAppTeamConfig.pathFilter(),
        );
        toast.success("Configurações pessoais salvas!");
      },
      onError: (error: any) => {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "❌ [useChatUserConfig] Error saving user config:",
            error,
          );
        }
        toast.error(
          `Erro ao salvar configurações: ${error.message || "Erro desconhecido"}`,
        );
      },
    }),
    [queryClient, trpc.app.getUserAppTeamConfig],
  );

  // ✅ Mutation para salvar configuração de USUÁRIO
  const saveConfigMutation = useMutation(
    trpc.app.saveUserAppTeamConfig.mutationOptions(mutationOptions),
  );

  // ✅ OTIMIZAÇÃO: Memoizar função saveConfig para evitar re-criação
  const saveConfig = useCallback(
    (newConfig: Partial<ChatUserConfig>) => {
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

      saveConfigMutation.mutate({
        appId: chatAppId,
        config: configToSave,
      });
    },
    [defaultConfig, config, saveConfigMutation],
  );

  // ✅ OTIMIZAÇÃO: Memoizar função savePreferredModel
  const savePreferredModel = useCallback(
    async (modelId: string) => {
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

      const result = await saveConfig(newConfig);
      return result;
    },
    [config, saveConfig],
  );

  // ✅ OTIMIZAÇÃO: Memoizar função getPreferredModelId para evitar re-criação
  const getPreferredModelId = useCallback(() => {
    return mergedConfig.personalSettings.preferredModelId;
  }, [mergedConfig.personalSettings.preferredModelId]);

  // ✅ OTIMIZAÇÃO: Memoizar função shouldAutoSelectModel
  const shouldAutoSelectModel = useCallback(() => {
    return mergedConfig.uiPreferences.autoSelectModel !== false;
  }, [mergedConfig.uiPreferences.autoSelectModel]);

  // ✅ OTIMIZAÇÃO: Memoizar objeto de retorno para evitar re-renders
  return useMemo(
    () => ({
      // Dados
      config: mergedConfig,
      isLoading,
      error,

      // Estado de loading
      isSaving: saveConfigMutation.isPending,

      // ✅ Funções principais para configurações PESSOAIS
      saveConfig,
      savePreferredModel,
      getPreferredModelId,
      shouldAutoSelectModel,

      // Configurações específicas (helpers) - memoizadas
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
      autoSaveConversations:
        mergedConfig.behaviorSettings.autoSaveConversations,
      enableTypingIndicator:
        mergedConfig.behaviorSettings.enableTypingIndicator,
    }),
    [
      mergedConfig,
      isLoading,
      error,
      saveConfigMutation.isPending,
      saveConfig,
      savePreferredModel,
      getPreferredModelId,
      shouldAutoSelectModel,
    ],
  );
}
