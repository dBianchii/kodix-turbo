"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  CheckCircle,
  GripVertical,
  Info,
  Loader2,
  TestTube,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";
import { Switch } from "@kdx/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

// Error Dialog Component
function ErrorDialog({
  isOpen,
  onClose,
  error,
  friendlyMessage,
  title = "Erro no Teste do Modelo",
}: {
  isOpen: boolean;
  onClose: () => void;
  error: string | null;
  friendlyMessage?: string;
  title?: string;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {t("apps.aiStudio.enabledModels.errors.testFailed")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Friendly Error Message */}
          {friendlyMessage && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">
                      {friendlyMessage}
                    </p>
                    <p className="mt-1 text-sm text-red-600">
                      {t("apps.aiStudio.enabledModels.errors.contactSupport")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details (Collapsible) */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? "Hide" : "Show"} Technical Details
            </Button>

            {showDetails && (
              <div className="mt-2 max-h-96 overflow-y-auto">
                <Card>
                  <CardContent className="pt-6">
                    <pre className="rounded-md border bg-red-50 p-4 font-mono text-sm whitespace-pre-wrap text-red-600">
                      {error}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            {t("Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente para mostrar preços com tooltip
interface PriceBadgeProps {
  model: any;
}

function PriceBadge({ model }: PriceBadgeProps) {
  const config = model.config;
  const pricing = config?.pricing;
  const description = config?.description;

  if (!pricing?.input) {
    return <span className="text-muted-foreground text-xs">N/A</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className="hover:bg-muted cursor-pointer text-xs"
        >
          ${pricing.input}/1K
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center" sideOffset={4}>
        <div className="space-y-2">
          {/* Título */}
          <div className="text-sm font-medium text-slate-900">
            {model.modelId}
          </div>

          {/* Descrição se disponível */}
          {description && (
            <p className="text-xs text-slate-600">{description}</p>
          )}

          {/* Preços detalhados */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Input:</span>
              <code className="rounded bg-green-100 px-1 text-green-800">
                ${pricing.input}/1K tokens
              </code>
            </div>

            {pricing.output && (
              <div className="flex justify-between">
                <span className="text-slate-600">Output:</span>
                <code className="rounded bg-blue-100 px-1 text-blue-800">
                  ${pricing.output}/1K tokens
                </code>
              </div>
            )}
          </div>

          {/* Configurações adicionais se disponíveis */}
          {(config?.maxTokens || config?.temperature) && (
            <div className="border-t pt-2 text-xs text-slate-500">
              {config?.maxTokens && <div>Max tokens: {config.maxTokens}</div>}
              {config?.temperature && (
                <div>Temperature: {config.temperature}</div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente sortable para cada linha da tabela
interface SortableTableRowProps {
  model: any;
  onToggle: (model: any) => void;
  onTest: (model: any) => void;
  onSetDefault: (modelId: string) => void;
  isToggling: boolean;
  isReordering: boolean;
  isTestingModel: boolean;
  isSettingDefault: boolean;
  testResults: any;
  defaultModelId: string | null;
}

function SortableTableRow({
  model,
  onToggle,
  onTest,
  onSetDefault,
  isToggling,
  isReordering,
  isTestingModel,
  isSettingDefault,
  testResults,
  defaultModelId,
}: SortableTableRowProps) {
  const t = useTranslations();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: model.modelId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isReordering ? 0.7 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div
            className={`rounded p-1 ${
              isReordering
                ? "bg-muted/50 cursor-wait"
                : "hover:bg-muted cursor-grab hover:cursor-grabbing"
            }`}
            {...(isReordering ? {} : listeners)}
          >
            <GripVertical
              className={`h-4 w-4 ${
                isReordering
                  ? "text-muted-foreground/50"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="bg-primary/10 rounded p-1">
            <Brain className="h-3 w-3" />
          </div>
          {model.modelId}
        </div>
      </TableCell>
      <TableCell className="capitalize">
        {model.provider?.name || "N/A"}
      </TableCell>
      <TableCell>
        <PriceBadge model={model} />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch
            checked={model.teamConfig?.enabled || false}
            onCheckedChange={() => onToggle(model)}
            disabled={
              isToggling ||
              isReordering ||
              (defaultModelId === model.modelId && model.teamConfig?.enabled)
            }
          />
          <span className="text-muted-foreground text-sm">
            {model.teamConfig?.enabled
              ? t("apps.aiStudio.enabledModels.enabled")
              : t("apps.aiStudio.enabledModels.disabled")}
            {defaultModelId === model.modelId && model.teamConfig?.enabled && (
              <span className="ml-1 text-xs text-amber-600">
                {t("apps.aiStudio.enabledModels.status.default")}
              </span>
            )}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex min-h-[2rem] items-center">
          {model.teamConfig?.enabled && (
            <RadioGroupItem
              value={model.modelId}
              checked={defaultModelId === model.modelId}
              disabled={isSettingDefault || isReordering}
              className="cursor-pointer"
            />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {model.teamConfig?.enabled && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(model)}
                disabled={isTestingModel || isReordering}
                className="h-8"
              >
                {isTestingModel ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <TestTube className="h-3 w-3" />
                )}
                {isTestingModel
                  ? t("apps.aiStudio.enabledModels.actions.testing")
                  : t("apps.aiStudio.enabledModels.actions.test")}
              </Button>
              {testResults && testResults.aiModelId === model.modelId && (
                <div className="flex items-center space-x-1">
                  {testResults.success ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600">
                        {testResults.latencyMs}ms
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span
                        className="max-w-[100px] truncate text-xs text-red-600"
                        title={testResults.error}
                      >
                        {testResults.error?.includes("Token")
                          ? t(
                              "apps.aiStudio.enabledModels.errors.tokenRequired",
                            )
                          : t("apps.aiStudio.enabledModels.errors.testFailed")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function EnabledModelsSection() {
  const t = useTranslations();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isReordering, setIsReordering] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testingModel, setTestingModel] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState("Olá, como você está?");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendlyErrorMessage, setFriendlyErrorMessage] = useState<
    string | null
  >(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // ✅ CORRIGIDO: Usar padrão useTRPC
  const { data: models, isLoading } = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(),
  );

  const { data: defaultModel } = useQuery(
    trpc.app.aiStudio.getDefaultModel.queryOptions(),
  );

  // ✅ CORRIGIDO: Usar padrão useTRPC com useMutation
  const toggleModelMutation = useMutation(
    trpc.app.aiStudio.toggleModel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        queryClient.invalidateQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );
        toast.success("Modelo atualizado com sucesso!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao atualizar modelo");
      },
    }),
  );

  const reorderModelsMutation = useMutation(
    trpc.app.aiStudio.reorderModelsPriority.mutationOptions({
      onMutate: () => {
        setIsReordering(true);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        queryClient.invalidateQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );
        toast.success("Prioridade dos modelos atualizada!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao reordenar modelos");
      },
      onSettled: () => {
        setIsReordering(false);
      },
    }),
  );

  const testModelMutation = useMutation(
    trpc.app.aiStudio.testModel.mutationOptions({
      onMutate: (variables: { aiModelId: string; testPrompt?: string }) => {
        console.log(
          "Testing model:",
          variables.aiModelId,
          "with prompt:",
          variables.testPrompt,
        );
        setTestingModelId(variables.aiModelId);
      },
      onSuccess: (data, variables) => {
        console.log("✅ [AI_STUDIO_TEST] Model test completed:", {
          aiModelId: variables.aiModelId,
          success: data.success,
          ...(data.success &&
            "latencyMs" in data && {
              latency: data.latencyMs,
              provider: data.providerName,
              responsePreview: data.responseText?.substring(0, 100),
            }),
        });

        // Include aiModelId in the response for proper identification
        const responseWithModelId = {
          ...data,
          aiModelId: variables.aiModelId,
        };
        setTestResponse(responseWithModelId);

        // Check if the test actually failed
        if (!data.success) {
          const errorMessage =
            "error" in data ? data.error : "Unknown error while testing model";
          console.error("❌ [AI_STUDIO_TEST] Test failed:", {
            aiModelId: variables.aiModelId,
            error: errorMessage,
          });

          // ✅ Extract friendly error message for server-side failures
          let friendlyMessage = t(
            "apps.aiStudio.enabledModels.errors.genericTestError",
          );

          // Extract user-friendly error message from specific error types
          if (errorMessage.includes("Token de API não configurado")) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.tokenRequired",
            );
          } else if (errorMessage.includes("Timeout")) {
            friendlyMessage = t("apps.aiStudio.enabledModels.errors.timeout");
          } else if (errorMessage.includes("API Error")) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.genericTestError",
            );
          } else if (errorMessage.includes("não encontrado")) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.modelNotFound",
            );
          } else if (errorMessage.includes("network")) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.networkError",
            );
          }

          // ✅ Show friendly message in toast
          toast.error(friendlyMessage);

          // ✅ Store both friendly message and technical details
          setFriendlyErrorMessage(friendlyMessage);
          const debugDetails = `🔧 Server-side Error:\n${errorMessage}\n\n📋 Additional Info:\n${"error" in data ? data.error : "Not available"}`;
          setError(debugDetails);
          setShowErrorDialog(true);
        } else {
          // Type guard ensures we're accessing success response properties
          if (data.success && "latencyMs" in data) {
            toast.success(`Model test successful! (${data.latencyMs}ms)`);
          }
        }
      },
      onError: (error: any) => {
        console.error("Error testing model:", error);
        const errorMessage =
          error.message || "Unknown error while testing model";

        // ✅ Extract user-friendly error message and debug info
        let friendlyMessage = t(
          "apps.aiStudio.enabledModels.errors.genericTestError",
        );
        let debugInfo = null;

        try {
          // Check if error message contains JSON debug info
          if (errorMessage.includes("Debug Info:")) {
            const parts = errorMessage.split("Debug Info:");
            if (parts.length > 1) {
              debugInfo = JSON.parse(parts[1]);

              // Generate user-friendly message based on error type
              if (debugInfo.status === 404) {
                friendlyMessage = t(
                  "apps.aiStudio.enabledModels.errors.modelNotFoundInProvider",
                  {
                    model: debugInfo.model,
                    provider: debugInfo.provider,
                  },
                );
              } else if (debugInfo.status === 401) {
                friendlyMessage = t(
                  "apps.aiStudio.enabledModels.errors.apiKeyAuthenticationFailed",
                  {
                    provider: debugInfo.provider,
                  },
                );
              } else if (debugInfo.status === 429) {
                friendlyMessage = t(
                  "apps.aiStudio.enabledModels.errors.rateLimitExceeded",
                  {
                    provider: debugInfo.provider,
                  },
                );
              } else if (debugInfo.status === 400) {
                friendlyMessage = t(
                  "apps.aiStudio.enabledModels.errors.invalidRequest",
                  {
                    provider: debugInfo.provider,
                  },
                );
              } else if (debugInfo.status >= 500) {
                friendlyMessage = t(
                  "apps.aiStudio.enabledModels.errors.serviceUnavailable",
                  {
                    provider: debugInfo.provider,
                  },
                );
              }
            }
          }
        } catch (parseError) {
          console.warn("Failed to parse error debug info:", parseError);
        }

        // ✅ Fallback error pattern matching for errors without Debug Info
        if (!debugInfo) {
          if (
            errorMessage.includes("API Key not found") ||
            errorMessage.includes("API key") ||
            errorMessage.includes("invalid API key") ||
            errorMessage.includes("missing API key")
          ) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.tokenRequired",
            );
          } else if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("401") ||
            errorMessage.includes("authentication")
          ) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.tokenRequired",
            );
          } else if (
            errorMessage.includes("not found") ||
            errorMessage.includes("404") ||
            errorMessage.includes("model not found")
          ) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.modelNotFound",
            );
          } else if (
            errorMessage.includes("rate limit") ||
            errorMessage.includes("429") ||
            errorMessage.includes("too many requests")
          ) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.rateLimitExceeded",
              {
                provider: "provider",
              },
            );
          } else if (
            errorMessage.includes("timeout") ||
            errorMessage.includes("timed out")
          ) {
            friendlyMessage = t("apps.aiStudio.enabledModels.errors.timeout");
          } else if (
            errorMessage.includes("network") ||
            errorMessage.includes("connection") ||
            errorMessage.includes("failed to fetch")
          ) {
            friendlyMessage = t(
              "apps.aiStudio.enabledModels.errors.networkError",
            );
          }
        }

        // ✅ Show friendly message in toast
        toast.error(friendlyMessage);

        // ✅ Store both friendly message and technical details
        setFriendlyErrorMessage(friendlyMessage);
        let debugDetails = errorMessage;
        if (debugInfo) {
          debugDetails = `🔍 Diagnostic Information:\n`;
          debugDetails += `• Provider: ${debugInfo.provider}\n`;
          debugDetails += `• Model: ${debugInfo.model}\n`;
          debugDetails += `• Endpoint: ${debugInfo.endpoint}\n`;
          debugDetails += `• Status: ${debugInfo.status} (${debugInfo.statusText})\n`;
          debugDetails += `• API Key: ${debugInfo.debugInfo?.hasToken ? "Configured" : "Missing"}\n`;
          debugDetails += `• Base URL: ${debugInfo.debugInfo?.baseUrl}\n`;
          debugDetails += `\n💡 Possible Solutions:\n`;

          if (debugInfo.status === 404) {
            debugDetails += `• Check if model name "${debugInfo.model}" exists in ${debugInfo.provider}\n`;
            debugDetails += `• Verify the API endpoint URL is correct\n`;
            debugDetails += `• Ensure your API key has access to this model\n`;
          } else if (debugInfo.status === 401) {
            debugDetails += `• Check if API key is valid and not expired\n`;
            debugDetails += `• Verify the API key has proper permissions\n`;
          } else if (debugInfo.status === 429) {
            debugDetails += `• API rate limit exceeded, try again later\n`;
            debugDetails += `• Consider upgrading your API plan\n`;
          }

          debugDetails += `\n🔧 Raw Error:\n${errorMessage}`;
          debugDetails += `\n\n📋 Stack Trace:\n${error?.stack || "Not available"}`;
        }

        setError(debugDetails);
        setShowErrorDialog(true);
      },
      onSettled: () => {
        setTestingModelId(null);
      },
    }),
  );

  const setDefaultModelMutation = useMutation(
    trpc.app.aiStudio.setDefaultModel.mutationOptions({
      onMutate: () => {
        setIsSettingDefault(true);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        queryClient.invalidateQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );
        toast.success("Modelo padrão definido!");
      },
      onError: (error: any) => {
        console.error("Error setting default model:", error);

        // ✅ Extract friendly error message
        let friendlyMessage = t(
          "apps.aiStudio.enabledModels.errors.genericSetDefaultError",
        );
        const errorMessage = error.message || "Unknown error";

        if (errorMessage.includes("not found")) {
          friendlyMessage = t(
            "apps.aiStudio.enabledModels.errors.modelNotFound",
          );
        } else if (errorMessage.includes("unauthorized")) {
          friendlyMessage = t(
            "apps.aiStudio.enabledModels.errors.permissionDenied",
          );
        } else if (errorMessage.includes("timeout")) {
          friendlyMessage = t("apps.aiStudio.enabledModels.errors.timeout");
        }

        toast.error(friendlyMessage);
      },
      onSettled: () => {
        setIsSettingDefault(false);
      },
    }),
  );

  // Setup sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleToggleModel = (model: any) => {
    // Check if trying to disable the default model
    if (defaultModel?.aiModelId === model.modelId && model.teamConfig?.enabled) {
      toast.error(t("apps.aiStudio.enabledModels.errors.cannotDisableDefault"));
      return;
    }

    toggleModelMutation.mutate({
      aiModelId: model.modelId,
      enabled: !model.teamConfig?.enabled,
    });
  };

  const handleTestModel = (model: any) => {
    setError(null);

    console.log("🧪 [AI_STUDIO_TEST] Starting model test:", {
      modelId: model.modelId,
      modelName: model.modelId,
      provider: model.provider?.name,
      config: model.config,
    });

    testModelMutation.mutate({
      aiModelId: model.modelId,
      testPrompt: "Hello! Are you working correctly?",
    });
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    setError(null);
    setFriendlyErrorMessage(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !models) {
      return;
    }

    const oldIndex = models.findIndex((model: any) => model.modelId === active.id);
    const newIndex = models.findIndex((model: any) => model.modelId === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new order of models after drag & drop
    const reorderedModels = [...models];
    const [movedModel] = reorderedModels.splice(oldIndex, 1);

    if (!movedModel) return;

    reorderedModels.splice(newIndex, 0, movedModel);

    // Extract only IDs in the new order to send to backend
    const orderedModelIds = reorderedModels.map((model: any) => model.modelId);

    console.log(`Reordering models:`, {
      movedModel: movedModel.modelId,
      fromPosition: oldIndex,
      toPosition: newIndex,
      newOrder: orderedModelIds,
    });

    // Execute mutation to reorder ALL priorities
    reorderModelsMutation.mutate({
      orderedModelIds,
    });
  };

  const handleSetDefault = (aiModelId: string) => {
    setDefaultModelMutation.mutate({ aiModelId });
  };

  // Create array of IDs for SortableContext
  const modelIds = models?.map((model: any) => model.modelId) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("apps.aiStudio.enabledModels.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("apps.aiStudio.enabledModels.description")}
          </p>
        </div>
      </div>

      {/* Default model alert - só aparece quando há um modelo padrão */}
      {defaultModel?.aiModelId && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>
              {t("apps.aiStudio.enabledModels.tableHeaders.default")}:
            </strong>{" "}
            {t("apps.aiStudio.enabledModels.alerts.defaultModelInfo")}
          </AlertDescription>
        </Alert>
      )}

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("apps.aiStudio.enabledModels.modelsWithTokens")}
          </CardTitle>
          <CardDescription>
            {t("apps.aiStudio.enabledModels.enableDisableDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground text-sm">
                {t("apps.aiStudio.enabledModels.status.loading")}
              </div>
            </div>
          ) : !models || models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <Brain className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("apps.aiStudio.enabledModels.noModelsMessage.title")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("apps.aiStudio.enabledModels.noModelsMessage.description")}
              </p>
              {/* Alert informativo - só aparece quando não há modelos */}
              <Alert className="max-w-md">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t("apps.aiStudio.enabledModels.noModels")}:</strong>{" "}
                  {t("apps.aiStudio.enabledModels.alerts.modelsInfo")}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <RadioGroup
                value={defaultModel?.aiModelId || ""}
                onValueChange={handleSetDefault}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("apps.aiStudio.enabledModels.tableHeaders.model")}
                      </TableHead>
                      <TableHead>
                        {t("apps.aiStudio.enabledModels.tableHeaders.provider")}
                      </TableHead>
                      <TableHead>
                        {t("apps.aiStudio.enabledModels.tableHeaders.price")}
                      </TableHead>
                      <TableHead>
                        {t("apps.aiStudio.enabledModels.tableHeaders.status")}
                      </TableHead>
                      <TableHead>
                        {t("apps.aiStudio.enabledModels.tableHeaders.default")}
                      </TableHead>
                      <TableHead>
                        {t("apps.aiStudio.enabledModels.tableHeaders.test")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <SortableContext
                    items={modelIds}
                    strategy={verticalListSortingStrategy}
                    disabled={isReordering}
                  >
                    <TableBody>
                      {models.map((model: any) => (
                        <SortableTableRow
                          key={model.modelId}
                          model={model}
                          onToggle={handleToggleModel}
                          onTest={handleTestModel}
                          onSetDefault={handleSetDefault}
                          isToggling={toggleModelMutation.isPending}
                          isReordering={isReordering}
                          isTestingModel={testingModelId === model.modelId}
                          isSettingDefault={isSettingDefault}
                          testResults={testResponse}
                          defaultModelId={defaultModel?.aiModelId || null}
                        />
                      ))}
                    </TableBody>
                  </SortableContext>
                </Table>
              </RadioGroup>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={handleErrorDialogClose}
        error={error}
        friendlyMessage={friendlyErrorMessage || undefined}
        title="Erro no Teste do Modelo"
      />
    </div>
  );
}
