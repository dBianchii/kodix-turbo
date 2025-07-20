"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui/table";

import { useTRPC } from "~/trpc/react";

export function ProvidersSection() {
  const t = useTranslations("apps.aiStudio.providers");
  const trpc = useTRPC();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingModels, setIsUpdatingModels] = useState(false);

  // Query providers (now read-only from JSON config)
  const providersQuery = useQuery(
    trpc.app.aiStudio.findAiProviders.queryOptions({
      limite: 50,
      offset: 0,
    }),
  );

  const providers = providersQuery.data ?? [];
  const isLoading = providersQuery.isLoading || isRefreshing;
  const isError = providersQuery.isError;

  // Query team tokens to show which providers have tokens configured
  const teamTokensQuery = useQuery(
    trpc.app.aiStudio.findAiTeamProviderTokens.queryOptions(),
  );
  const teamTokens = teamTokensQuery.data ?? [];

  // Mutation for syncing models from providers
  const syncModelsMutation = useMutation(
    trpc.app.aiStudio.syncModels.mutationOptions({
      onSuccess: (data, variables) => {
        console.log(
          `✅ Successfully synced models for ${variables.providerId}:`,
          data,
        );
      },
      onError: (error, variables) => {
        console.error(
          `❌ Failed to sync models for ${variables.providerId}:`,
          error,
        );
      },
    }),
  );

  // Enhanced refetch function that updates both queries with visual feedback
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("🔄 Refreshing providers and tokens...");
    try {
      // Add minimum delay to ensure user sees the loading state
      const [refreshResult] = await Promise.all([
        Promise.all([providersQuery.refetch(), teamTokensQuery.refetch()]),
        new Promise((resolve) => setTimeout(resolve, 800)), // Minimum 800ms for visual feedback
      ]);
      console.log("✅ Refresh completed successfully");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to update models from all providers
  const handleUpdateModels = async () => {
    setIsUpdatingModels(true);
    console.log("🔄 Updating models from all providers...");
    try {
      // Sync models for each provider that has tokens configured
      const providersWithTokens = providers.filter((provider: any) =>
        getProviderHasToken(provider.providerId),
      );

      console.log(
        `🔄 Syncing models for ${providersWithTokens.length} providers with tokens...`,
      );

      // Sync models for each provider sequentially
      for (const provider of providersWithTokens) {
        console.log(
          `🔄 Syncing models for ${provider.name} (${provider.providerId})...`,
        );
        try {
          await syncModelsMutation.mutateAsync({
            providerId: provider.providerId,
          });
          console.log(`✅ Successfully synced models for ${provider.name}`);
        } catch (error) {
          console.error(
            `❌ Failed to sync models for ${provider.name}:`,
            error,
          );
        }
      }

      console.log("✅ Models sync completed for all providers");

      // Refresh the data after updating models
      await Promise.all([providersQuery.refetch(), teamTokensQuery.refetch()]);
    } catch (error) {
      console.error("❌ Error updating models:", error);
    } finally {
      setIsUpdatingModels(false);
    }
  };

  const handleManageToken = (providerId: string) => {
    // Navigate to token management or open token modal
    console.log("Manage token for provider:", providerId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{t("failedToLoad")}</AlertDescription>
          </Alert>
          <Button
            onClick={handleRefresh}
            className="mt-4"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Tentando novamente..." : t("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check which providers have tokens
  const getProviderHasToken = (providerId: string) => {
    return teamTokens.some((token: any) => token.providerId === providerId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Atualizando..." : t("refresh")}
              </Button>
              <Button
                onClick={handleUpdateModels}
                variant="default"
                disabled={isUpdatingModels}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isUpdatingModels ? "animate-spin" : ""}`}
                />
                {isUpdatingModels
                  ? "Atualizando Modelos..."
                  : "Atualizar Modelos"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{t("configChanged")}</strong> {t("configChangedDesc")}
            </AlertDescription>
          </Alert>

          {providers.length === 0 ? (
            <div className="py-8 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t("noProvidersFound")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("noProvidersFoundDesc")}
              </p>
              <div className="bg-muted rounded-md p-4 text-left">
                <p className="text-muted-foreground text-sm">
                  <strong>{t("configFile")}</strong>
                  <br />
                  <code className="text-xs">
                    packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json
                  </code>
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider: any) => (
                  <TableRow key={provider.providerId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                          <span className="text-primary text-xs font-medium">
                            {provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {provider.providerId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getProviderHasToken(provider.providerId) ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-700">
                            Token Configured
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-muted-foreground text-sm">
                            No Token
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          Read-only
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageToken(provider.providerId)}
                          className="text-xs"
                        >
                          Manage Token
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
