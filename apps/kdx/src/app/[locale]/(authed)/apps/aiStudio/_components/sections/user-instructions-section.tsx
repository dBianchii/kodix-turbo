"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "@kdx/ui/toast";

import { aiStudioAppId } from "@kdx/shared";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import { Textarea } from "@kdx/ui/textarea";

import { useTRPC } from "~/trpc/react";

export function UserInstructionsSection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Buscar configuração atual
  const configQuery = useQuery({
    ...trpc.app.getUserAppTeamConfig.queryOptions({ appId: aiStudioAppId }),
  });

  const config = configQuery.data;
  const isLoading = configQuery.isLoading;

  // Mutation para salvar
  const saveMutation = useMutation({
    ...trpc.app.saveUserAppTeamConfig.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.app.getUserAppTeamConfig.queryKey({
            appId: aiStudioAppId,
          }),
        });
        toast.success("Instruções pessoais salvas com sucesso!");
        setIsDirty(false);
      },
      onError: (error: any) => {
        toast.error(`Erro ao salvar: ${error.message}`);
      },
    }),
  });

  // Carregar dados quando chegam do servidor
  useEffect(() => {
    // Type assertion para AI Studio config
    const aiStudioConfig = config as {
      userInstructions?: { content?: string; enabled?: boolean };
    };
    if (aiStudioConfig?.userInstructions) {
      setContent(aiStudioConfig.userInstructions.content || "");
      setEnabled(aiStudioConfig.userInstructions.enabled || false);
    }
  }, [config]);

  // Marcar como alterado quando usuário digita
  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    setIsDirty(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      appId: aiStudioAppId,
      config: {
        userInstructions: {
          content,
          enabled,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instruções Pessoais de IA</CardTitle>
        <CardDescription>
          Configure como a IA deve se comportar especificamente para você. Estas
          instruções têm prioridade sobre as instruções do time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enabled"
            checked={enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="enabled" className="text-sm font-medium">
            Habilitar instruções pessoais
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Suas instruções para a IA:
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Digite suas instruções personalizadas para a IA..."
            className="min-h-[120px]"
            maxLength={2500}
            disabled={!enabled}
          />
          <div className="text-muted-foreground text-right text-xs">
            {content.length}/2500 caracteres
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={!isDirty || saveMutation.isPending}
          className="ml-auto"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
