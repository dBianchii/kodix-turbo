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

import { api } from "~/trpc/react";

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
              {testResults && testResults.modelId === model.id && (
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
  const queryClient = useQueryClient();

  // ✅ Adicionar utils para invalidação correta
  const utils = api.useUtils();

  const [isReordering, setIsReordering] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testingModel, setTestingModel] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState("Olá, como você está?");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  // ✅ CORRIGIDO: Usar api hooks diretamente
  const { data: models, isLoading } =
    api.app.aiStudio.findAvailableModels.useQuery();

  const { data: defaultModel } = api.app.aiStudio.getDefaultModel.useQuery();

  // ✅ CORRIGIDO: Usar api mutations diretamente
  const toggleModelMutation = api.app.aiStudio.toggleModel.useMutation({
    onSuccess: () => {
      // ✅ Invalidar queries específicas usando utils (padrão correto)
      void utils.app.aiStudio.findAvailableModels.invalidate();
      void utils.app.aiStudio.getDefaultModel.invalidate();
      // ✅ Invalidação adicional para garantir atualização
      void utils.app.aiStudio.invalidate();
      toast.success("Modelo atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar modelo");
    },
  });

  const reorderModelsMutation =
    api.app.aiStudio.reorderModelsPriority.useMutation({
      onMutate: () => {
        setIsReordering(true);
      },
      onSuccess: () => {
        // ✅ Invalidar queries específicas usando utils (padrão correto)
        void utils.app.aiStudio.findAvailableModels.invalidate();
        void utils.app.aiStudio.getDefaultModel.invalidate();
        // ✅ Invalidação adicional para garantir atualização
        void utils.app.aiStudio.invalidate();
        toast.success("Prioridade dos modelos atualizada!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Erro ao reordenar modelos");
      },
      onSettled: () => {
        setIsReordering(false);
      },
    });

  const testModelMutation = api.app.aiStudio.testModel.useMutation({
    onMutate: (variables: { modelId: string; testPrompt?: string }) => {
      console.log(
        "Testing model:",
        variables.modelId,
        "with prompt:",
        variables.testPrompt,
      );
      setIsTestingModel(true);
    },
    onSuccess: (data, variables) => {
      // Include modelId in the response for proper identification
      setTestResponse({
        ...data,
        modelId: variables.modelId,
      });
      toast.success("Teste do modelo realizado!");
    },
    onError: (error: any) => {
      console.error("Error testing model:", error);
      toast.error(error.message || "Erro ao testar modelo");
    },
    onSettled: () => {
      setIsTestingModel(false);
    },
  });

  const setDefaultModelMutation = api.app.aiStudio.setDefaultModel.useMutation({
    onMutate: () => {
      setIsSettingDefault(true);
    },
    onSuccess: () => {
      // ✅ Invalidar queries específicas usando utils (padrão correto)
      void utils.app.aiStudio.findAvailableModels.invalidate();
      void utils.app.aiStudio.getDefaultModel.invalidate();
      // ✅ Invalidação adicional para garantir atualização
      void utils.app.aiStudio.invalidate();
      toast.success("Modelo padrão definido!");
    },
    onError: (error: any) => {
      console.error("Error setting default model:", error);
      toast.error(error.message || "Erro ao definir modelo padrão");
    },
    onSettled: () => {
      setIsSettingDefault(false);
    },
  });

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

      {/* Default model alert - só aparece quando há um modelo padrão */}
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
                          testResults={testResponse}
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
