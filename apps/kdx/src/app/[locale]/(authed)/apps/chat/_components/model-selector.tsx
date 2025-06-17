"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Check, ChevronDown, Loader2, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
import { Badge } from "@kdx/ui/badge";
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

interface ModelSelectorProps {
  selectedModelId?: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
}

interface AvailableModel {
  id: string;
  name: string;
  providerId: string;
  config?: any;
  enabled: boolean;
  provider: {
    id: string;
    name: string;
    baseUrl?: string;
  };
  teamConfig?: {
    id: string;
    modelId: string;
    teamId: string;
    enabled: boolean;
    priority: number;
    createdAt: Date;
    updatedAt?: Date;
  } | null;
}

export function ModelSelector({
  selectedModelId,
  onModelSelect,
  disabled = false,
}: ModelSelectorProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  // ✅ CORRIGIDO: Usar arquitetura useTRPC configurada
  const trpc = useTRPC();
  const availableModelsQuery = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(),
  );

  // ✅ CORRIGIDO: Filtrar apenas modelos que o team explicitamente marcou como habilitados
  const availableModels = (availableModelsQuery.data?.filter(
    (model: any) => model.teamConfig?.enabled === true,
  ) || []) as AvailableModel[];

  const isLoading = availableModelsQuery.isLoading;

  // Debug: log dos modelos disponíveis
  console.log(
    "🔍 [MODEL_SELECTOR] Modelos carregados do backend:",
    availableModelsQuery.data?.length || 0,
  );
  console.log(
    "🔍 [MODEL_SELECTOR] Modelos habilitados pelo team:",
    availableModels.length,
  );
  availableModels.forEach((model: any) => {
    console.log(
      `   ✅ ${model.name} (ID: ${model.id}) - priority: ${model.teamConfig?.priority || "não definida"}`,
    );
  });

  // Agrupar modelos por provedor e ordenar por prioridade
  const modelsByProvider = availableModels.reduce(
    (acc, model) => {
      const providerName = model.provider.name;

      if (providerName) {
        if (!acc[providerName]) {
          acc[providerName] = [];
        }
        acc[providerName].push(model);
      }

      return acc;
    },
    {} as Record<string, AvailableModel[]>,
  );

  // Ordenar modelos dentro de cada provedor por prioridade (menor número = maior prioridade)
  Object.keys(modelsByProvider).forEach((providerName) => {
    const models = modelsByProvider[providerName];
    if (models) {
      models.sort((a, b) => {
        const priorityA = a.teamConfig?.priority ?? 999;
        const priorityB = b.teamConfig?.priority ?? 999;
        return priorityA - priorityB;
      });
    }
  });

  // Encontrar o modelo selecionado
  const selectedModel = availableModels.find(
    (model) => model.id === selectedModelId,
  );

  // Função para obter o nome do modelo para exibição
  const getModelDisplayName = (model: AvailableModel) => {
    const config = model.config;
    return config?.version || model.name;
  };

  // Função para obter informações de pricing se disponível
  const getModelInfo = (model: AvailableModel) => {
    const config = model.config;
    const pricing = config?.pricing;
    const description = config?.description;

    return { pricing, description };
  };

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[200px] justify-between"
          disabled={disabled || isLoading}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            {isLoading ? (
              <span className="text-muted-foreground">
                Carregando modelos...
              </span>
            ) : selectedModel ? (
              <div className="flex items-center gap-2">
                <span className="truncate">
                  {getModelDisplayName(selectedModel)}
                </span>
                {selectedModel.provider && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedModel.provider.name}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar modelo</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar modelo..." className="h-9" />
          <CommandList className="max-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground ml-2 text-sm">
                  Carregando modelos...
                </span>
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum modelo encontrado</CommandEmpty>

                {Object.entries(modelsByProvider).map(
                  ([providerName, models]) => (
                    <CommandGroup key={providerName} heading={providerName}>
                      {models.map((model) => {
                        const displayName = getModelDisplayName(model);
                        const { pricing, description } = getModelInfo(model);
                        const isSelected = model.id === selectedModelId;
                        const priority = model.teamConfig?.priority;

                        return (
                          <CommandItem
                            key={model.id}
                            value={`${displayName} ${model.name} ${providerName}`}
                            onSelect={() => handleModelSelect(model.id)}
                            className="flex items-center justify-between py-3"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <Check
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate font-medium">
                                    {displayName}
                                  </span>
                                  {priority !== undefined && priority < 10 && (
                                    <Zap className="h-3 w-3 text-amber-500" />
                                  )}
                                </div>
                                {description && (
                                  <p className="text-muted-foreground truncate text-xs">
                                    {description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              {pricing?.input && (
                                <Badge variant="outline" className="text-xs">
                                  ${pricing.input}/1K
                                </Badge>
                              )}
                              {priority !== undefined && (
                                <Badge variant="secondary" className="text-xs">
                                  #{priority}
                                </Badge>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ),
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
