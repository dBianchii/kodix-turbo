"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  // Buscar configuração existente
  const { data: config, isLoading } = useQuery(
    trpc.app.getUserAppTeamConfig.queryOptions({ appId: aiStudioAppId }),
  );

  // Mutation para salvar
  const saveMutation = useMutation(
    trpc.app.saveUserAppTeamConfig.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.getUserAppTeamConfig.pathFilter({ appId: aiStudioAppId }),
        );
        toast.success(
          "Suas instruções pessoais foram atualizadas com sucesso.",
        );
      },
      onError: () => {
        toast.error(
          "Não foi possível salvar suas instruções. Tente novamente.",
        );
      },
    }),
  );

  // Atualizar estado quando carregar dados
  useEffect(() => {
    if (config?.userInstructions?.content) {
      setContent(config.userInstructions.content);
    }
  }, [config]);

  const handleSave = () => {
    saveMutation.mutate({
      appId: aiStudioAppId,
      config: {
        userInstructions: {
          content,
          enabled: true,
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Instruções Pessoais de IA</CardTitle>
        <CardDescription>
          Estas instruções são suas e serão aplicadas a todas as interações com
          a IA na plataforma, sobrepondo as instruções da equipe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite suas instruções pessoais aqui..."
          className="min-h-[200px]"
          maxLength={2500}
          disabled={isLoading || saveMutation.isPending}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {content.length}/2500 caracteres
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || isLoading}
        >
          {saveMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Salvar Instruções
        </Button>
      </CardFooter>
    </Card>
  );
}
