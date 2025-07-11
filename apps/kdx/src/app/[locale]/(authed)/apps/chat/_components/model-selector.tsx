"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { Skeleton } from "@kdx/ui/skeleton";

import { useTRPC } from "~/trpc/react";

interface ModelSelectorProps {
  selectedModelId: string | null;
  onModelSelect: (modelId: string) => void;
  className?: string;
  disabled?: boolean;
}

interface Model {
  id: string;
  displayName: string;
  teamConfig: {
    enabled: boolean;
  } | null;
}

export function ModelSelector({
  selectedModelId,
  onModelSelect,
  className,
  disabled,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const trpc = useTRPC();

  const { data: availableModels, isLoading: isLoadingModels } = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
  );

  const safeAvailableModels = useMemo(() => {
    if (Array.isArray(availableModels)) {
      return availableModels as Model[];
    }
    return [];
  }, [availableModels]);

  const processedModels = useMemo(() => {
    return safeAvailableModels
      .filter((model) => model.teamConfig?.enabled === true)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [safeAvailableModels]);

  const currentModel = useMemo(() => {
    return safeAvailableModels.find((model) => model.id === selectedModelId);
  }, [selectedModelId, safeAvailableModels]);

  const handleSelect = (modelId: string) => {
    onModelSelect(modelId);
    setIsOpen(false);
  };

  if (isLoadingModels) {
    return <Skeleton className={cn("h-10 w-full", className)} />;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {currentModel ? currentModel.displayName : "Select a model"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {processedModels.map((model) => (
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
                  {model.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
