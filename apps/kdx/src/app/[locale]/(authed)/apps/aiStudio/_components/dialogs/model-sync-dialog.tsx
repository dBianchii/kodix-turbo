"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

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

interface ModelSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

type SyncState = "idle" | "syncing" | "reviewing" | "applying" | "completed";

interface ModelPricing {
  input: string;
  output: string;
  unit: "per_million_tokens";
}

interface NormalizedModel {
  modelId: string;
  name: string;
  displayName?: string;
  maxTokens?: number;
  pricing?: ModelPricing;
  version?: string;
  description?: string;
  status?: "active" | "archived";
  databaseId?: string; // Optional database ID for existing models
}

interface ModelSyncDiff {
  providerId: string;
  timestamp: Date;
  newModels: NormalizedModel[];
  updatedModels: {
    existing: NormalizedModel;
    updated: NormalizedModel;
  }[];
  archivedModels: NormalizedModel[];
}

// Error Dialog Component
function ErrorDialog({
  isOpen,
  onClose,
  error,
  title = "Erro na Sincronização",
}: {
  isOpen: boolean;
  onClose: () => void;
  error: string | null;
  title?: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Ocorreu um erro durante a operação. Veja os detalhes abaixo:
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          <Card>
            <CardContent className="pt-6">
              <pre className="rounded-md border bg-red-50 p-4 font-mono text-sm whitespace-pre-wrap text-red-600">
                {error}
              </pre>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModelSyncDialog({
  isOpen,
  onClose,
  providerId,
  providerName,
}: ModelSyncDialogProps) {
  const t = useTranslations("apps.aiStudio.models");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncDiff, setSyncDiff] = useState<ModelSyncDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Sync models mutation
  const syncModelsMutation = useMutation(
    trpc.app.aiStudio.syncModels.mutationOptions({
      onSuccess: (data: any) => {
        console.log("✅ Sync successful:", data);
        setSyncDiff(data);
        setSyncState("reviewing");
        // Auto-expand sections with changes
        const sectionsToExpand = new Set<string>();
        if (data.newModels.length > 0) sectionsToExpand.add("new-models");
        if (data.updatedModels.length > 0)
          sectionsToExpand.add("updated-models");
        if (data.archivedModels.length > 0)
          sectionsToExpand.add("archived-models");
        setExpandedSections(sectionsToExpand);
        toast.success("Sincronização concluída com sucesso!");
      },
      onError: (error: any) => {
        console.error("❌ Sync error:", error);
        const errorMessage =
          error?.message || error?.data?.message || "Error syncing models";

        // Check for specific error types
        if (
          errorMessage.includes("API_KEY") ||
          errorMessage.includes("not configured")
        ) {
          toast.error(
            `API key not configured for ${providerName}. Please contact your administrator.`,
          );
        } else if (errorMessage.includes("not available yet")) {
          toast.error(errorMessage);
        } else {
          toast.error(
            `Failed to sync models from ${providerName}: ${errorMessage}`,
          );
        }

        setError(
          `Erro na sincronização:\n\n${errorMessage}\n\nStack trace:\n${error?.stack || "Não disponível"}`,
        );
        setShowErrorDialog(true);
        setSyncState("idle");
      },
    }),
  );

  // Apply sync mutation
  const applySyncMutation = useMutation(
    trpc.app.aiStudio.applySync.mutationOptions({
      onSuccess: (result: any) => {
        console.log("✅ Apply sync successful:", result);
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findModels.pathFilter(),
        );

        // Show detailed success message
        const {
          newModelsCount,
          updatedModelsCount,
          archivedModelsCount,
          errors,
        } = result;
        let message = "Models synchronized successfully!";

        if (
          newModelsCount > 0 ||
          updatedModelsCount > 0 ||
          archivedModelsCount > 0
        ) {
          const parts = [];
          if (newModelsCount > 0) parts.push(`${newModelsCount} new`);
          if (updatedModelsCount > 0)
            parts.push(`${updatedModelsCount} updated`);
          if (archivedModelsCount > 0)
            parts.push(`${archivedModelsCount} archived`);
          message += ` (${parts.join(", ")})`;
        }

        toast.success(message);

        // Show warnings if there were any errors
        if (errors && errors.length > 0) {
          console.warn("⚠️ Some errors occurred during sync:", errors);
          toast.warning(
            `Sync completed with ${errors.length} warnings. Check console for details.`,
          );
        }

        setSyncState("completed");
        setTimeout(() => {
          onClose();
          resetDialog();
        }, 2000);
      },
      onError: (error: any) => {
        console.error("❌ Apply sync error:", error);
        const errorMessage =
          error?.message || error?.data?.message || "Error applying sync";
        setError(
          `Erro ao aplicar alterações:\n\n${errorMessage}\n\nStack trace:\n${error?.stack || "Não disponível"}`,
        );
        setShowErrorDialog(true);
        setSyncState("reviewing");
      },
    }),
  );

  const resetDialog = () => {
    setSyncState("idle");
    setSyncDiff(null);
    setExpandedSections(new Set());
  };

  const handleStartSync = async () => {
    try {
      setSyncState("syncing");
      setError(null);
      await syncModelsMutation.mutateAsync({ providerId });
    } catch (err) {
      // Error is already handled in onError callback
      console.error("Sync failed:", err);
    }
  };

  const handleApplyChanges = async () => {
    if (!syncDiff) return;

    try {
      setSyncState("applying");
      setError(null);
      await applySyncMutation.mutateAsync({
        providerId,
        newModels: syncDiff.newModels,
        updatedModels: syncDiff.updatedModels.map(({ existing, updated }) => ({
          id: existing.databaseId || existing.modelId,
          updates: {
            name: updated.name !== existing.name ? updated.name : undefined,
            displayName:
              updated.displayName !== existing.displayName
                ? updated.displayName
                : undefined,
            maxTokens:
              updated.maxTokens !== existing.maxTokens
                ? updated.maxTokens
                : undefined,
            pricing:
              JSON.stringify(updated.pricing) !==
              JSON.stringify(existing.pricing)
                ? updated.pricing
                : undefined,
            version:
              updated.version !== existing.version
                ? updated.version
                : undefined,
            description:
              updated.description !== existing.description
                ? updated.description
                : undefined,
            status:
              updated.status !== existing.status ? updated.status : undefined,
          },
        })),
        archivedModels: syncDiff.archivedModels,
      });
    } catch (err) {
      // Error is already handled in onError callback
      console.error("Apply changes failed:", err);
    }
  };

  const handleClose = () => {
    if (syncState === "syncing" || syncState === "applying") {
      toast.error("Aguarde a conclusão da operação atual");
      return;
    }
    setSyncState("idle");
    setSyncDiff(null);
    setError(null);
    onClose();
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    setError(null);
  };

  const getTotalChanges = () => {
    if (!syncDiff) return 0;
    return (
      syncDiff.newModels.length +
      syncDiff.updatedModels.length +
      syncDiff.archivedModels.length
    );
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isLoading = syncState === "syncing" || syncState === "applying";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Models - {providerName}
            </DialogTitle>
            <DialogDescription>
              Synchronize AI models from {providerName} with the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {syncState === "idle" && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Click the button below to fetch the latest models from{" "}
                  {providerName} and see what changes will be applied.
                </p>
              </div>
            )}

            {syncState === "syncing" && (
              <div className="py-8 text-center">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Fetching latest models from {providerName}...
                </p>
              </div>
            )}

            {syncState === "reviewing" && syncDiff && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Review Changes</h3>
                  <Badge variant="outline">
                    {getTotalChanges()} total changes
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* New Models Section */}
                  {syncDiff.newModels.length > 0 && (
                    <Card>
                      <CardHeader
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleSection("new-models")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              {syncDiff.newModels.length} New Models
                            </Badge>
                          </div>
                          {expandedSections.has("new-models") ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedSections.has("new-models") && (
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Model Name</TableHead>
                                <TableHead>Max Tokens</TableHead>
                                <TableHead>Pricing</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {syncDiff.newModels.map((model: any) => (
                                <TableRow key={model.modelId}>
                                  <TableCell className="font-medium">
                                    <div>
                                      <div>{model.name}</div>
                                      {model.displayName &&
                                        model.displayName !== model.name && (
                                          <div className="text-muted-foreground text-sm">
                                            {model.displayName}
                                          </div>
                                        )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {model.maxTokens
                                      ? model.maxTokens.toLocaleString()
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {model.pricing ? (
                                      <div className="text-sm">
                                        <div>Input: ${model.pricing.input}</div>
                                        <div>
                                          Output: ${model.pricing.output}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {model.pricing.unit}
                                        </div>
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Updated Models Section */}
                  {syncDiff.updatedModels.length > 0 && (
                    <Card>
                      <CardHeader
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleSection("updated-models")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="default"
                              className="bg-blue-100 text-blue-800"
                            >
                              {syncDiff.updatedModels.length} Updated Models
                            </Badge>
                          </div>
                          {expandedSections.has("updated-models") ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedSections.has("updated-models") && (
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Model Name</TableHead>
                                <TableHead>Changes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {syncDiff.updatedModels.map(
                                ({ existing, updated }: any) => (
                                  <TableRow key={existing.modelId}>
                                    <TableCell className="font-medium">
                                      <div>
                                        <div>{existing.name}</div>
                                        {existing.displayName &&
                                          existing.displayName !==
                                            existing.name && (
                                            <div className="text-muted-foreground text-sm">
                                              {existing.displayName}
                                            </div>
                                          )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1 text-sm">
                                        {updated.name !== existing.name && (
                                          <div>
                                            <span className="font-medium">
                                              Name:
                                            </span>{" "}
                                            {existing.name} → {updated.name}
                                          </div>
                                        )}
                                        {updated.maxTokens !==
                                          existing.maxTokens && (
                                          <div>
                                            <span className="font-medium">
                                              Max Tokens:
                                            </span>{" "}
                                            {existing.maxTokens?.toLocaleString() ||
                                              "N/A"}{" "}
                                            →{" "}
                                            {updated.maxTokens?.toLocaleString() ||
                                              "N/A"}
                                          </div>
                                        )}
                                        {JSON.stringify(updated.pricing) !==
                                          JSON.stringify(existing.pricing) && (
                                          <div>
                                            <span className="font-medium">
                                              Pricing:
                                            </span>{" "}
                                            Updated
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Archived Models Section */}
                  {syncDiff.archivedModels.length > 0 && (
                    <Card>
                      <CardHeader
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => toggleSection("archived-models")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="default"
                              className="bg-orange-100 text-orange-800"
                            >
                              {syncDiff.archivedModels.length} Archived Models
                            </Badge>
                          </div>
                          {expandedSections.has("archived-models") ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardHeader>
                      {expandedSections.has("archived-models") && (
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Model Name</TableHead>
                                <TableHead>Max Tokens</TableHead>
                                <TableHead>Pricing</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {syncDiff.archivedModels.map((model: any) => (
                                <TableRow key={model.modelId}>
                                  <TableCell className="font-medium">
                                    <div>
                                      <div>{model.name}</div>
                                      {model.displayName &&
                                        model.displayName !== model.name && (
                                          <div className="text-muted-foreground text-sm">
                                            {model.displayName}
                                          </div>
                                        )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {model.maxTokens
                                      ? model.maxTokens.toLocaleString()
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {model.pricing ? (
                                      <div className="text-sm">
                                        <div>Input: ${model.pricing.input}</div>
                                        <div>
                                          Output: ${model.pricing.output}
                                        </div>
                                        <div className="text-muted-foreground">
                                          {model.pricing.unit}
                                        </div>
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            )}

            {syncState === "applying" && (
              <div className="py-8 text-center">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Applying changes to the platform...
                </p>
              </div>
            )}

            {syncState === "completed" && (
              <div className="py-8 text-center">
                <Check className="mx-auto mb-4 h-8 w-8 text-green-600" />
                <p className="text-muted-foreground">
                  Models synchronized successfully!
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {syncState === "idle" && (
                  <Button onClick={handleStartSync} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Sync
                  </Button>
                )}
                {syncState === "reviewing" && (
                  <Button onClick={handleApplyChanges} disabled={isLoading}>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Changes ({getTotalChanges()})
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={handleErrorDialogClose}
        error={error}
        title="Erro na Sincronização de Modelos"
      />
    </>
  );
}
