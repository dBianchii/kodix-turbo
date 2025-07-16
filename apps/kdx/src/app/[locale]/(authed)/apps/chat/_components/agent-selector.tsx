"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Check, ChevronsUpDown } from "lucide-react";

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
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

interface AgentSelectorProps {
  sessionId?: string; // ✅ Opcional para funcionar na welcome screen
  selectedAgentId: string | null;
  onAgentSelect?: (agentId: string | null) => void;
  className?: string;
  disabled?: boolean;
}

interface Agent {
  id: string;
  name: string;
  description?: string | null;
}

export function AgentSelector({
  sessionId,
  selectedAgentId,
  onAgentSelect,
  className,
  disabled,
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Query para buscar agentes disponíveis
  const { data: availableAgents, isLoading: isLoadingAgents } = useQuery(
    trpc.app.aiStudio.findAiAgents.queryOptions(
      { limite: 100, offset: 0 },
      {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    ),
  );

  const safeAvailableAgents = useMemo(() => {
    if (Array.isArray(availableAgents?.agents)) {
      return availableAgents.agents as Agent[];
    }
    return [];
  }, [availableAgents]);

  const processedAgents = useMemo(() => {
    return safeAvailableAgents.sort((a, b) => a.name.localeCompare(b.name));
  }, [safeAvailableAgents]);

  const currentAgent = useMemo(() => {
    return safeAvailableAgents.find((agent) => agent.id === selectedAgentId);
  }, [selectedAgentId, safeAvailableAgents]);

  // Mutation para atualizar sessão (otimizada)
  const updateSessionMutation = useMutation(
    trpc.app.chat.updateSession.mutationOptions({
      onSuccess: (updatedSession) => {
        onAgentSelect?.(updatedSession.aiAgentId || null);
        setIsOpen(false);

        // ✅ Invalidação otimizada para garantir sincronização
        // Invalidar a sessão específica que foi alterada
        void queryClient.invalidateQueries({
          queryKey: ["trpc", "app", "chat", "findSession"],
        });

        // Invalidar lista de sessões para atualizar o sidebar
        void queryClient.invalidateQueries(
          trpc.app.chat.findSessions.pathFilter(),
        );
      },
      onError: (error) => {
        // Show backend error message directly (already translated)
        toast.error(error.message || "Failed to update agent");
      },
    }),
  );

  const handleSelect = (agentId: string | null) => {
    if (agentId === selectedAgentId) {
      setIsOpen(false);
      return; // Já é o agente atual
    }

    if (sessionId) {
      // ✅ Tem sessão: atualizar no backend
      updateSessionMutation.mutate({
        id: sessionId,
        aiAgentId: agentId || undefined,
        activeAgentId: agentId || null,
      });
    } else {
      // ✅ Sem sessão (welcome screen): apenas callback local
      onAgentSelect?.(agentId);
      setIsOpen(false);
    }
  };

  if (isLoadingAgents) {
    return <Skeleton className={cn("h-10 w-full", className)} />;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled || updateSessionMutation.isPending}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {currentAgent ? currentAgent.name : "No agent"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search agent..." />
          <CommandEmpty>No agent found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {/* Opção sem agente */}
              <CommandItem value="no-agent" onSelect={() => handleSelect(null)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !currentAgent ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 opacity-50" />
                  No agent
                </div>
              </CommandItem>

              {/* Lista de agentes */}
              {processedAgents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.id}
                  onSelect={() => handleSelect(agent.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentAgent?.id === agent.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    {agent.description && (
                      <span className="text-muted-foreground ml-6 text-xs">
                        {agent.description}
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
}
