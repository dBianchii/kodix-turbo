"use client";

import { memo, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

import { useTRPC } from "~/trpc/react";
import { useChatUserConfig } from "../_hooks/useChatUserConfig";

interface ModelSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// ✅ OTIMIZAÇÃO: Memoizar componente para evitar re-renders desnecessários
export const ModelSelector = memo(function ModelSelector({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Selecione um modelo...",
  className,
}: ModelSelectorProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { savePreferredModel, getPreferredModelId } = useChatUserConfig();

  // ✅ Buscar modelos disponíveis
  const { data: availableModels, isLoading: isLoadingModels } = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000, // ✅ OTIMIZAÇÃO: 5 minutos para reduzir requests
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
  );

  // ✅ OTIMIZAÇÃO: Memoizar processamento de modelos para evitar re-cálculos
  const processedModels = useMemo(() => {
    const allModels = availableModels || [];

    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔍 [CHAT_MODEL_SELECTOR] Modelos carregados do backend:",
        allModels.length,
      );
      console.log(
        "🔍 [CHAT_MODEL_SELECTOR] Modelos habilitados pelo team:",
        allModels.filter((model: any) => model.teamConfig?.enabled).length,
      );
    }

    // Filtrar apenas modelos habilitados pela equipe
    const enabledModels = allModels.filter(
      (model: any) => model.teamConfig?.enabled === true,
    );

    // Ordenar por nome para melhor UX
    const sortedModels = enabledModels.sort((a: any, b: any) =>
      a.name.localeCompare(b.name),
    );

    return sortedModels;
  }, [availableModels]);

  // ✅ OTIMIZAÇÃO: Memoizar modelo selecionado atual
  const currentModel = useMemo(() => {
    const modelId = value || getPreferredModelId();
    return processedModels.find((model: any) => model.id === modelId);
  }, [value, getPreferredModelId, processedModels]);

  // ✅ OTIMIZAÇÃO: Memoizar função de seleção para evitar re-criação
  const handleSelect = useCallback(
    async (modelId: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 [CHAT_MODEL_SELECTOR] Modelo selecionado:", modelId);
      }

      // Atualizar valor local se callback fornecido
      onValueChange?.(modelId);

      // Salvar como preferência do usuário
      try {
        await savePreferredModel(modelId);

        // Invalidar queries relacionadas para atualizar UI
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );

        if (process.env.NODE_ENV === "development") {
          console.log("✅ [CHAT_MODEL_SELECTOR] Preferência salva com sucesso");
        }
      } catch (error) {
        console.error(
          "❌ [CHAT_MODEL_SELECTOR] Erro ao salvar preferência:",
          error,
        );
      }
    },
    [
      onValueChange,
      savePreferredModel,
      queryClient,
      trpc.app.aiStudio.findAvailableModels,
    ],
  );

  // ✅ OTIMIZAÇÃO: Memoizar texto do botão para evitar re-cálculos
  const buttonText = useMemo(() => {
    if (currentModel) {
      return currentModel.name;
    }
    return placeholder;
  }, [currentModel, placeholder]);

  // ✅ OTIMIZAÇÃO: Memoizar classe do botão
  const buttonClassName = useMemo(() => {
    return cn(
      "w-full justify-between",
      !currentModel && "text-muted-foreground",
      className,
    );
  }, [currentModel, className]);

  if (isLoadingModels) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn("w-full justify-between", className)}
      >
        Carregando modelos...
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={buttonClassName}
        >
          {buttonText}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar modelo..." />
          <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {processedModels.map((model: any) => (
                <CommandItem
                  key={model.id}
                  value={model.name}
                  onSelect={() => handleSelect(model.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentModel?.id === model.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    {model.description && (
                      <span className="text-muted-foreground text-xs">
                        {model.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
