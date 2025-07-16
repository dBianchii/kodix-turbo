"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@kdx/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
import { toast } from "@kdx/ui/toast";

import { useTRPC } from "~/trpc/react";

interface ModelSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

type SyncState = "idle" | "syncing" | "completed";

export function ModelSyncDialog({
  isOpen,
  onClose,
  providerId,
  providerName,
}: ModelSyncDialogProps) {
  const t = useTranslations("apps.aiStudio.models");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [result, setResult] = useState<{
    modelsProcessed: number;
    errors: string[];
  } | null>(null);

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Simplified sync mutation
  const syncModelsMutation = useMutation(
    trpc.app.aiStudio.syncModels.mutationOptions({
      onSuccess: (data: any) => {
        console.log("✅ Sync successful:", data);
        setResult(data);
        setSyncState("completed");

        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries(
          trpc.app.aiStudio.findModels.pathFilter(),
        );

        // Show success message
        if (data.errors && data.errors.length > 0) {
          toast.warning(
            `Sync completed with ${data.errors.length} warnings. Check results for details.`,
          );
        } else {
          toast.success(
            `Successfully processed ${data.modelsProcessed} models for ${providerName}!`,
          );
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          resetDialog();
        }, 3000);
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

  const resetDialog = () => {
    setSyncState("idle");
    setResult(null);
    setError(null);
    setShowErrorDialog(false);
  };

  const handleStartSync = () => {
    setSyncState("syncing");
    setError(null);
    syncModelsMutation.mutate({ providerId });
  };

  const handleClose = () => {
    if (syncState === "syncing") {
      return; // Don't allow closing while syncing
    }
    onClose();
    resetDialog();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[80vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Models - {providerName}
            </DialogTitle>
            <DialogDescription>
              Copy all models from synced-models.json to the database for{" "}
              {providerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {syncState === "idle" && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Click the button below to copy all models from
                  synced-models.json to the database for {providerName}.
                </p>
                <Button
                  onClick={handleStartSync}
                  disabled={syncModelsMutation.isPending}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Sync
                </Button>
              </div>
            )}

            {syncState === "syncing" && (
              <div className="py-8 text-center">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Copying models from synced-models.json to database...
                </p>
              </div>
            )}

            {syncState === "completed" && result && (
              <div className="space-y-4 py-8 text-center">
                <Check className="mx-auto h-8 w-8 text-green-600" />
                <div>
                  <p className="mb-2 font-medium text-green-600">
                    Sync completed successfully!
                  </p>
                  <p className="text-muted-foreground">
                    Processed {result.modelsProcessed} models for {providerName}
                  </p>

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="mb-2 font-medium text-yellow-800">
                        Warnings ({result.errors.length}):
                      </p>
                      <ul className="space-y-1 text-left text-sm text-yellow-700">
                        {result.errors.map((error, index) => (
                          <li key={index} className="truncate">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      {showErrorDialog && (
        <Dialog
          open={showErrorDialog}
          onOpenChange={() => setShowErrorDialog(false)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sync Error</DialogTitle>
              <DialogDescription>
                Error details from the model synchronization process
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <pre className="rounded bg-gray-100 p-4 text-sm whitespace-pre-wrap">
                {error}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
