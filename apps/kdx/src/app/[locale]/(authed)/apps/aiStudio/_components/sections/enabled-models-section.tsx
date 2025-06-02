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
import { Button } from "@kdx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kdx/ui/card";
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

// Componente sortable para cada linha da tabela
interface SortableTableRowProps {
  model: any;
  onToggle: (model: any) => void;
  onTest: (model: any) => void;
  onSetDefault: (modelId: string) => void;
  isToggling: boolean;
  isReordering: boolean;
  isTestingModel: string | null;
  isSettingDefault: boolean;
  testResults: Record<string, any>;
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
  } = useSortable({ id: model.id });

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
          {model.name}
        </div>
      </TableCell>
      <TableCell className="capitalize">
        {model.provider?.name || "N/A"}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch
            checked={model.teamConfig?.enabled || false}
            onCheckedChange={() => onToggle(model)}
            disabled={
              isToggling ||
              isReordering ||
              (defaultModelId === model.id && model.teamConfig?.enabled)
            }
          />
          <span className="text-muted-foreground text-sm">
            {model.teamConfig?.enabled
              ? t("apps.aiStudio.enabledModels.enabled")
              : t("apps.aiStudio.enabledModels.disabled")}
            {defaultModelId === model.id && model.teamConfig?.enabled && (
              <span className="ml-1 text-xs text-amber-600">
                {t("apps.aiStudio.enabledModels.status.default")}
              </span>
            )}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex min-h-[2rem] items-center">
          {model.teamConfig?.enabled ? (
            <RadioGroupItem
              value={model.id}
              checked={defaultModelId === model.id}
              disabled={isSettingDefault || isReordering}
              className="cursor-pointer"
            />
          ) : (
            <span className="text-muted-foreground text-xs">
              {t("apps.aiStudio.enabledModels.actions.enableToSetDefault")}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {model.teamConfig?.enabled ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(model)}
                disabled={isTestingModel === model.id || isReordering}
                className="h-8"
              >
                {isTestingModel === model.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <TestTube className="h-3 w-3" />
                )}
                {isTestingModel === model.id
                  ? t("apps.aiStudio.enabledModels.actions.testing")
                  : t("apps.aiStudio.enabledModels.actions.test")}
              </Button>
              {testResults[model.id] && (
                <div className="flex items-center space-x-1">
                  {testResults[model.id].success ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600">
                        {testResults[model.id].latencyMs}ms
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span
                        className="max-w-[100px] truncate text-xs text-red-600"
                        title={testResults[model.id].error}
                      >
                        {testResults[model.id].error?.includes("Token")
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
          ) : (
            <span className="text-muted-foreground text-sm">
              {t("apps.aiStudio.enabledModels.actions.enableToTest")}
            </span>
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

  // Estado para indicar quando está reordenando
  const [isReordering, setIsReordering] = useState(false);

  // Estados para gerenciar testes
  const [isTestingModel, setIsTestingModel] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Estados para gerenciar modelo padrão
  const [isSettingDefault, setIsSettingDefault] = useState(false);

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

  // Query to fetch available models
  const { data: models, isLoading } = useQuery(
    trpc.app.aiStudio.findAvailableModels.queryOptions(),
  );

  // Query to fetch default model
  const { data: defaultModel } = useQuery(
    trpc.app.aiStudio.getDefaultModel.queryOptions(),
  );

  // Mutations to manage team models
  const toggleModelMutation = useMutation(
    trpc.app.aiStudio.toggleModel.mutationOptions({
      onMutate: async (variables) => {
        // Cancel ongoing queries to avoid conflicts
        await queryClient.cancelQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        await queryClient.cancelQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );

        // Snapshot of previous state
        const previousModels = queryClient.getQueryData(
          trpc.app.aiStudio.findAvailableModels.queryOptions().queryKey,
        );
        const previousDefaultModel = queryClient.getQueryData(
          trpc.app.aiStudio.getDefaultModel.queryOptions().queryKey,
        );

        // Optimistic update for available models
        queryClient.setQueryData(
          trpc.app.aiStudio.findAvailableModels.queryOptions().queryKey,
          (old: any) => {
            if (!old) return old;
            return old.map((model: any) =>
              model.id === variables.modelId
                ? {
                    ...model,
                    teamConfig: {
                      ...model.teamConfig,
                      enabled: variables.enabled,
                    },
                  }
                : model,
            );
          },
        );

        // If enabling a model and there's no current default, optimistically set this as default
        if (variables.enabled && !previousDefaultModel?.modelId) {
          queryClient.setQueryData(
            trpc.app.aiStudio.getDefaultModel.queryOptions().queryKey,
            (old: any) => ({
              ...old,
              modelId: variables.modelId,
            }),
          );
        }

        return { previousModels, previousDefaultModel };
      },
      onError: (err, variables, context) => {
        // Rollback optimistic update in case of error
        if (context?.previousModels) {
          queryClient.setQueryData(
            trpc.app.aiStudio.findAvailableModels.queryOptions().queryKey,
            context.previousModels,
          );
        }

        if (context?.previousDefaultModel) {
          queryClient.setQueryData(
            trpc.app.aiStudio.getDefaultModel.queryOptions().queryKey,
            context.previousDefaultModel,
          );
        }

        console.error("❌ [FRONTEND] Error updating model:", err);

        // Check for specific error types
        if (
          err.message.includes("padrão") ||
          err.message.includes("default") ||
          err.message.includes("cannot disable") ||
          err.message.includes("não pode ser desativado")
        ) {
          toast.error(
            t("apps.aiStudio.enabledModels.errors.cannotDisableDefault"),
          );
        } else if (err.message.includes("pelo menos um modelo")) {
          toast.error(t("apps.aiStudio.enabledModels.errors.atleastOneModel"));
        } else {
          toast.error(
            t("apps.aiStudio.enabledModels.errors.updateError") +
              `: ${err.message || ""}`,
          );
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        // Also invalidate the default model query to reflect automatic default assignment
        queryClient.invalidateQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );
        toast.success(t("apps.aiStudio.enabledModels.success.modelUpdated"));
      },
    }),
  );

  // Mutation to reorder models via drag & drop - using reorderModelsPriority
  const reorderModelsMutation = useMutation(
    trpc.app.aiStudio.reorderModelsPriority.mutationOptions({
      onMutate: async (variables) => {
        // Indicate that it's reordering
        setIsReordering(true);

        // Cancel ongoing queries to avoid conflicts
        await queryClient.cancelQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );

        // Snapshot of previous state for rollback if needed
        const previousModels = queryClient.getQueryData(
          trpc.app.aiStudio.findAvailableModels.queryOptions().queryKey,
        );

        // Optimistic update: reorder models locally
        queryClient.setQueryData(
          trpc.app.aiStudio.findAvailableModels.queryOptions().queryKey,
          (old: any) => {
            if (!old || !Array.isArray(old)) return old;

            // Create new order based on provided IDs
            const reorderedModels = variables.orderedModelIds
              .map((modelId, index) => {
                const model = old.find((m: any) => m.id === modelId);
                if (!model) return null;

                // Update priority in teamConfig
                return {
                  ...model,
                  teamConfig: {
                    ...model.teamConfig,
                    priority: index,
                  },
                };
              })
              .filter(Boolean); // Remove nulls

            return reorderedModels;
          },
        );

        return { previousModels };
      },
      onError: (err, variables, context) => {
        // Stop loading indicator
        setIsReordering(false);

        // Rollback on error
        if (context?.previousModels) {
          queryClient.setQueryData(
            trpc.app.aiStudio.findAvailableModels.queryOptions().queryKey,
            context.previousModels,
          );
        }
        toast.error(t("apps.aiStudio.enabledModels.errors.reorderError"));
      },
      onSuccess: () => {
        // Stop loading indicator
        setIsReordering(false);

        // Invalidate queries to ensure synchronization with the server
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        toast.success(t("apps.aiStudio.enabledModels.success.priorityUpdated"));
      },
    }),
  );

  // Mutation to test models
  const testModelMutation = useMutation(
    trpc.app.aiStudio.testModel.mutationOptions({
      onMutate: async (variables: { modelId: string; testPrompt?: string }) => {
        console.log(
          `🧪 [FRONTEND] Starting test of model ${variables.modelId}`,
        );
        setIsTestingModel(variables.modelId);
      },
      onError: (
        err: any,
        variables: { modelId: string; testPrompt?: string },
      ) => {
        console.error("❌ [FRONTEND] Test error:", err);
        setIsTestingModel(null);
        setTestResults((prev) => ({
          ...prev,
          [variables.modelId]: {
            success: false,
            error: err.message,
            timestamp: new Date().toISOString(),
          },
        }));

        // More specific error messages
        if (err.message.includes("Token")) {
          toast.error(t("apps.aiStudio.enabledModels.errors.tokenRequired"));
        } else if (err.message.includes("Modelo não encontrado")) {
          toast.error(t("apps.aiStudio.enabledModels.errors.modelNotFound"));
        } else if (
          err.message.includes("500") ||
          err.message.includes("Internal Server Error")
        ) {
          toast.error(t("apps.aiStudio.enabledModels.errors.internalError"));
        } else {
          toast.error(
            t("apps.aiStudio.enabledModels.errors.testFailed") +
              `: ${err.message}`,
          );
        }
      },
      onSuccess: (
        data: any,
        variables: { modelId: string; testPrompt?: string },
      ) => {
        console.log("✅ [FRONTEND] Test completed successfully:", data);
        setIsTestingModel(null);
        setTestResults((prev) => ({
          ...prev,
          [variables.modelId]: data,
        }));

        if (data.success) {
          toast.success(
            t("apps.aiStudio.enabledModels.success.testSuccess", {
              latency: data.latencyMs,
              response: data.responseText?.substring(0, 50),
            }),
          );
        } else {
          toast.error(
            t("apps.aiStudio.enabledModels.errors.testFailed") +
              `: ${data.error}`,
          );
        }
      },
    }),
  );

  // Mutation to set default model
  const setDefaultModelMutation = useMutation(
    trpc.app.aiStudio.setDefaultModel.mutationOptions({
      onMutate: async (variables) => {
        setIsSettingDefault(true);
        console.log(
          `🎯 [FRONTEND] Setting default model: ${variables.modelId}`,
        );

        // Cancel ongoing queries to avoid conflicts
        await queryClient.cancelQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );

        // Snapshot of previous state for rollback if needed
        const previousDefaultModel = queryClient.getQueryData(
          trpc.app.aiStudio.getDefaultModel.queryOptions().queryKey,
        );

        // Optimistic update: set the new default model immediately
        queryClient.setQueryData(
          trpc.app.aiStudio.getDefaultModel.queryOptions().queryKey,
          (old: any) => {
            if (!old) return old;
            return { ...old, modelId: variables.modelId };
          },
        );

        return { previousDefaultModel };
      },
      onError: (err: any, variables, context) => {
        setIsSettingDefault(false);
        console.error("❌ [FRONTEND] Error setting default model:", err);

        // Rollback on error
        if (context?.previousDefaultModel) {
          queryClient.setQueryData(
            trpc.app.aiStudio.getDefaultModel.queryOptions().queryKey,
            context.previousDefaultModel,
          );
        }

        toast.error(
          t("apps.aiStudio.enabledModels.errors.setDefaultError") +
            `: ${err.message || ""}`,
        );
      },
      onSuccess: (data: any, variables) => {
        setIsSettingDefault(false);
        console.log("✅ [FRONTEND] Default model set:", data);

        // Invalidate queries to ensure server synchronization
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findAvailableModels.pathFilter(),
        );
        queryClient.invalidateQueries(
          trpc.app.aiStudio.getDefaultModel.pathFilter(),
        );

        toast.success(t("apps.aiStudio.enabledModels.success.defaultSet"));
      },
    }),
  );

  const handleToggleModel = (model: any) => {
    // Check if trying to disable the default model
    if (defaultModel?.modelId === model.id && model.teamConfig?.enabled) {
      toast.error(t("apps.aiStudio.enabledModels.errors.cannotDisableDefault"));
      return;
    }

    toggleModelMutation.mutate({
      modelId: model.id,
      enabled: !model.teamConfig?.enabled,
    });
  };

  const handleTestModel = (model: any) => {
    testModelMutation.mutate({
      modelId: model.id,
      testPrompt: "Hello! Are you working correctly?",
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !models) {
      return;
    }

    const oldIndex = models.findIndex((model: any) => model.id === active.id);
    const newIndex = models.findIndex((model: any) => model.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new order of models after drag & drop
    const reorderedModels = [...models];
    const [movedModel] = reorderedModels.splice(oldIndex, 1);

    if (!movedModel) return;

    reorderedModels.splice(newIndex, 0, movedModel);

    // Extract only IDs in the new order to send to backend
    const orderedModelIds = reorderedModels.map((model: any) => model.id);

    console.log(`Reordering models:`, {
      movedModel: movedModel.name,
      fromPosition: oldIndex,
      toPosition: newIndex,
      newOrder: orderedModelIds,
    });

    // Execute mutation to reorder ALL priorities
    reorderModelsMutation.mutate({
      orderedModelIds,
    });
  };

  const handleSetDefault = (modelId: string) => {
    setDefaultModelMutation.mutate({ modelId });
  };

  // Create array of IDs for SortableContext
  const modelIds = models?.map((model: any) => model.id) || [];

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

      {/* Informative alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{t("apps.aiStudio.enabledModels.noModels")}:</strong>{" "}
          {t("apps.aiStudio.enabledModels.alerts.modelsInfo")}
        </AlertDescription>
      </Alert>

      {/* Default model alert */}
      {defaultModel?.modelId && (
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
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <RadioGroup
                value={defaultModel?.modelId || ""}
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
                          key={model.id}
                          model={model}
                          onToggle={handleToggleModel}
                          onTest={handleTestModel}
                          onSetDefault={handleSetDefault}
                          isToggling={toggleModelMutation.isPending}
                          isReordering={isReordering}
                          isTestingModel={isTestingModel}
                          isSettingDefault={isSettingDefault}
                          testResults={testResults}
                          defaultModelId={defaultModel?.modelId || null}
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
    </div>
  );
}
