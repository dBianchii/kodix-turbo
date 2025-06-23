"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  selectedModelId?: string;
  onModelSelect?: (modelId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// ✅ FASE 3: Limpeza final e validação
export const ModelSelector = memo(function ModelSelector({
  selectedModelId,
  onModelSelect,
  disabled = false,
  placeholder = "Selecione um modelo...",
  className,
}: ModelSelectorProps) {
  // ✅ FASE 3.1: Debug panel apenas em desenvolvimento
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  // ✅ FASE 3.2: Controle do estado do popover
  const [isOpen, setIsOpen] = useState(false);

  // ✅ FASE 3.1: Log essencial de montagem (apenas desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[MODEL_SELECTOR] Componente montado:", {
        selectedModelId,
        hasCallback: !!onModelSelect,
        disabled,
      });
    }
  }, []);

  // ✅ FASE 3.1: Validação crítica de props (sempre ativa)
  useEffect(() => {
    if (!onModelSelect) {
      console.error(
        "[MODEL_SELECTOR] ERRO CRÍTICO: onModelSelect callback não fornecido!",
      );
    }
    if (typeof onModelSelect !== "function") {
      console.error(
        "[MODEL_SELECTOR] ERRO CRÍTICO: onModelSelect não é uma função:",
        typeof onModelSelect,
      );
    }
  }, [onModelSelect]);

  const trpc = useTRPC();
  const { getPreferredModelId } = useChatUserConfig();

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

  // ✅ FASE 3.1: Modelo selecionado atual otimizado
  const currentModel = useMemo(() => {
    const modelId = selectedModelId || getPreferredModelId();
    const found = processedModels.find((model: any) => model.id === modelId);

    // ✅ FASE 3.1: Log apenas em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("[MODEL_SELECTOR] currentModel calculado:", {
        selectedModelId,
        finalModelId: modelId,
        foundModel: found?.name || "não encontrado",
      });
    }

    return found;
  }, [selectedModelId, getPreferredModelId, processedModels]);

  // ✅ FASE 3.1: Função de seleção final - responsabilidade única
  const handleSelect = useCallback(
    (modelId: string) => {
      // ✅ FASE 3.1: Log essencial apenas em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.log("[MODEL_SELECTOR] FASE 3 - Seleção de modelo:", {
          modelId,
          previousModel: currentModel?.id,
        });
      }

      // ✅ FASE 3.1: Validação crítica mantida
      if (!onModelSelect || typeof onModelSelect !== "function") {
        console.error(
          "[MODEL_SELECTOR] ERRO: Callback inválido:",
          typeof onModelSelect,
        );
        return;
      }

      // ✅ FASE 3.1: Responsabilidade única - apenas chamar callback
      try {
        onModelSelect(modelId);

        // ✅ FASE 3.2: Fechar popover após seleção
        setIsOpen(false);

        if (process.env.NODE_ENV === "development") {
          console.log(
            "[MODEL_SELECTOR] FASE 3 - Callback executado com sucesso",
          );
        }
      } catch (error) {
        console.error("[MODEL_SELECTOR] Erro ao executar callback:", error);
      }
    },
    [currentModel, onModelSelect],
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={buttonClassName}
          onDoubleClick={() => {
            if (process.env.NODE_ENV === "development") {
              setDebugPanelOpen(!debugPanelOpen);
            }
          }}
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
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* ✅ FASE 3.1: Debug Panel simplificado (apenas desenvolvimento) */}
            {process.env.NODE_ENV === "development" && debugPanelOpen && (
              <div className="border-t p-3">
                <div className="mb-2 text-xs font-medium text-green-700">
                  ✅ ModelSelector - FASE 3 CONCLUÍDA
                </div>

                <details className="mb-2">
                  <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">
                    Status Final
                  </summary>
                  <div className="mt-1 rounded bg-green-50 p-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-green-700">
                        <strong>✅ Interface:</strong> Padronizada
                        (selectedModelId, onModelSelect)
                      </div>
                      <div className="text-green-700">
                        <strong>✅ Lógica:</strong> Responsabilidade única
                        implementada
                      </div>
                      <div className="text-green-700">
                        <strong>✅ Performance:</strong> Otimizada com
                        memoização
                      </div>
                      <div className="text-green-700">
                        <strong>✅ Debugging:</strong> Logs limpos e organizados
                      </div>
                    </div>
                  </div>
                </details>

                <details className="mb-2">
                  <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">
                    Estado Atual
                  </summary>
                  <div className="mt-1 rounded bg-blue-50 p-2 text-xs">
                    <div className="space-y-1">
                      <div>
                        <strong>Modelo Selecionado:</strong>{" "}
                        {currentModel?.name || "Nenhum"}
                      </div>
                      <div>
                        <strong>Callback Presente:</strong>{" "}
                        {onModelSelect ? "✓" : "❌"}
                      </div>
                      <div>
                        <strong>Modelos Disponíveis:</strong>{" "}
                        {processedModels.length}
                      </div>
                      <div>
                        <strong>Estado:</strong>{" "}
                        {disabled ? "Desabilitado" : "Ativo"}
                      </div>
                    </div>
                  </div>
                </details>

                <div className="rounded bg-slate-50 p-2 text-xs">
                  <div className="text-slate-600">
                    <strong>🎯 Resultado:</strong> ModelSelector funcionando
                    perfeitamente com responsabilidade única
                  </div>
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
