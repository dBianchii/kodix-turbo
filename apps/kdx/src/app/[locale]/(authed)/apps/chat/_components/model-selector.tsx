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

export const ModelSelector = memo(function ModelSelector({
  selectedModelId,
  onModelSelect,
  disabled = false,
  placeholder = "Selecione um modelo...",
  className,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const trpc = useTRPC();
  const { getPreferredModelId } = useChatUserConfig();

  // ✅ Buscar modelos disponíveis
  const { data: availableModels, isLoading: isLoadingModels } = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
  );

  // ✅ Processar modelos disponíveis
  const processedModels = useMemo(() => {
    const allModels = availableModels || [];
    const enabledModels = allModels.filter(
      (model: any) => model.teamConfig?.enabled === true,
    );
    return enabledModels.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [availableModels]);

  // ✅ Encontrar modelo atual
  const currentModel = useMemo(() => {
    return processedModels.find((model: any) => model.id === selectedModelId);
  }, [selectedModelId, processedModels]);

  // ✅ Função de seleção
  const handleSelect = useCallback(
    (modelId: string) => {
      if (!onModelSelect || typeof onModelSelect !== "function") {
        return;
      }

      try {
        onModelSelect(modelId);
        setIsOpen(false);
      } catch (error) {
        console.error("[MODEL_SELECTOR] Erro ao executar callback:", error);
      }
    },
    [onModelSelect],
  );

  // ✅ Texto do botão
  const buttonText = useMemo(() => {
    return currentModel ? currentModel.name : placeholder;
  }, [currentModel, placeholder]);

  // ✅ Classe do botão
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
                  value={model.id}
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
