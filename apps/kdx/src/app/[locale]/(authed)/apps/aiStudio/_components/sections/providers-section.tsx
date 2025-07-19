"use client";

import { AlertTriangle, Info, RefreshCw } from "lucide-react";
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

import { useTRPC } from "~/trpc/react";
import { AiProviderCard } from "../../providers/components/AiProviderCard";

export function ProvidersSection() {
  const t = useTranslations("aiStudio.providers");
  const trpc = useTRPC();

  // Query providers (now read-only from JSON config)
  const {
    data: providers = [],
    isLoading,
    isError,
    refetch,
  } = trpc.app.aiStudio.findAiProviders.useQuery({
    limite: 50,
    offset: 0,
  });

  // Query team tokens to show which providers have tokens configured
  const { data: teamTokens = [] } = trpc.app.aiStudio.findTeamTokens.useQuery();

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
              <CardDescription>
                {t("description")}
              </CardDescription>
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
            <AlertDescription>
              {t("failedToLoad")}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
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
              <CardDescription>
                {t("description")}
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("refresh")}
            </Button>
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
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t("noProvidersFound")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("noProvidersFoundDesc")}
              </p>
              <div className="rounded-md bg-muted p-4 text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>{t("configFile")}</strong><br />
                  <code className="text-xs">
                    packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json
                  </code>
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider: any) => (
                <AiProviderCard
                  key={provider.providerId}
                  provider={provider}
                  hasToken={getProviderHasToken(provider.providerId)}
                  onManageToken={handleManageToken}
                />
              ))}
            </div>
          )}

          {providers.length > 0 && (
            <div className="mt-6 p-4 rounded-md bg-muted/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">{t("providerManagement")}</p>
                  <p>
                    {t("providerManagementDesc")}
                  </p>
                  <p className="mt-2">
                    <strong>{t("fileLocation")}</strong><br />
                    <code className="text-xs">
                      packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}