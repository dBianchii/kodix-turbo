"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, MessageSquare, Save, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { aiStudioAppId } from "@kdx/shared";
import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import { Label } from "@kdx/ui/label";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";
import { Switch } from "@kdx/ui/switch";
import { Textarea } from "@kdx/ui/textarea";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

export function TeamInstructionsSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Estados locais para o formulário
  const [content, setContent] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [appliesTo, setAppliesTo] = useState<"chat" | "all">("chat");
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Query para buscar configurações atuais
  const configQuery = useQuery({
    ...trpc.app.getConfig.queryOptions({
      appId: aiStudioAppId,
    }),
  });

  const currentConfig = configQuery.data;
  const isLoading = configQuery.isLoading;

  // Atualizar estado quando dados carregarem
  useEffect(() => {
    // Forçamos a tipagem para a configuração do AI Studio
    const aiStudioConfig = currentConfig as {
      teamInstructions?: {
        content?: string;
        enabled?: boolean;
        appliesTo?: "chat" | "all";
      };
    };

    if (aiStudioConfig?.teamInstructions) {
      setContent(aiStudioConfig.teamInstructions.content ?? "");
      setEnabled(aiStudioConfig.teamInstructions.enabled ?? false);
      setAppliesTo(aiStudioConfig.teamInstructions.appliesTo ?? "chat");
    }
  }, [currentConfig]);

  // Mutation para salvar configurações
  const updateInstructionsMutation = useMutation({
    ...trpc.app.saveConfig.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.app.getConfig.queryKey({ appId: aiStudioAppId }),
        });
        toast.success(t("apps.aiStudio.teamInstructions.saved"));
        setIsDirty(false);
      },
      onError: (error) => {
        toast.error(
          t("apps.aiStudio.teamInstructions.error") + ": " + error.message,
        );
      },
    }),
  });

  const handleSave = () => {
    updateInstructionsMutation.mutate({
      appId: aiStudioAppId,
      config: {
        teamInstructions: {
          content: content.trim(),
          enabled,
          appliesTo,
        },
      },
    });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    setIsDirty(true);
  };

  const handleAppliesToChange = (value: "chat" | "all") => {
    setAppliesTo(value);
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("apps.aiStudio.teamInstructions.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("apps.aiStudio.teamInstructions.description")}
          </p>
        </div>
      </div>

      {/* Status Atual */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>{t("apps.aiStudio.teamInstructions.currentStatus")}:</strong>{" "}
          {enabled
            ? `${t("apps.aiStudio.teamInstructions.enabled")} - ${appliesTo === "chat" ? t("apps.aiStudio.teamInstructions.appliesToOptions.chat") : t("apps.aiStudio.teamInstructions.appliesToOptions.all")}`
            : t("apps.aiStudio.teamInstructions.instructionsDisabled")}
        </AlertDescription>
      </Alert>

      {/* Formulário Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t("apps.aiStudio.teamInstructions.title")}
          </CardTitle>
          <CardDescription>
            {t("apps.aiStudio.teamInstructions.helpText")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle para habilitar/desabilitar */}
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={handleEnabledChange}
            />
            <Label htmlFor="enabled" className="text-sm font-medium">
              {t("apps.aiStudio.teamInstructions.enabled")}
            </Label>
          </div>

          {/* Campo de texto para instruções */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              {t("apps.aiStudio.teamInstructions.content")}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={t(
                "apps.aiStudio.teamInstructions.contentPlaceholder",
              )}
              className="min-h-[120px] resize-none"
              disabled={!enabled}
            />
            <p className="text-muted-foreground text-xs">
              {content.length} caracteres
            </p>
          </div>

          {/* Seleção de onde aplicar */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t("apps.aiStudio.teamInstructions.appliesTo")}
            </Label>
            <RadioGroup
              value={appliesTo}
              onValueChange={handleAppliesToChange}
              disabled={!enabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chat" id="chat" />
                <Label htmlFor="chat" className="text-sm">
                  {t("apps.aiStudio.teamInstructions.appliesToOptions.chat")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="text-sm">
                  {t("apps.aiStudio.teamInstructions.appliesToOptions.all")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!isDirty || updateInstructionsMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateInstructionsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("apps.aiStudio.teamInstructions.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("apps.aiStudio.teamInstructions.save")}
                </>
              )}
            </Button>

            {enabled && content.trim() && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {t("apps.aiStudio.teamInstructions.preview")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prévia das instruções */}
      {showPreview && enabled && content.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t("apps.aiStudio.teamInstructions.preview")}
            </CardTitle>
            <CardDescription>
              {t("apps.aiStudio.teamInstructions.previewText")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground font-mono text-sm">
                <strong>Sistema:</strong> {content}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
