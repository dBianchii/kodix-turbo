"use client";

import {
  AlertCircle,
  ArrowLeft,
  Database,
  Home,
  RefreshCw,
  Server,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";

interface ErrorFallbackProps {
  error?: Error;
  message?: string;
  title?: string;
  type?: "server" | "network" | "database" | "client" | "generic";
  size?: "sm" | "md" | "lg";
  showRetry?: boolean;
  showNavigation?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
}

export function ErrorFallback({
  error,
  message,
  title,
  type = "generic",
  size = "md",
  showRetry = true,
  showNavigation = false,
  onRetry,
  onGoHome,
  onGoBack,
  className = "",
}: ErrorFallbackProps) {
  const t = useTranslations("api.errors");

  const getErrorIcon = () => {
    const iconSize =
      size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8";

    switch (type) {
      case "database":
        return <Database className={`${iconSize} text-blue-500`} />;
      case "network":
        return <Wifi className={`${iconSize} text-orange-500`} />;
      case "server":
        return <Server className={`${iconSize} text-red-500`} />;
      case "client":
        return <AlertCircle className={`${iconSize} text-purple-500`} />;
      default:
        return <AlertCircle className={`${iconSize} text-gray-500`} />;
    }
  };

  const getErrorContent = () => {
    if (title && message) {
      return { title, message };
    }

    switch (type) {
      case "database":
        return {
          title: t("server.database.title"),
          message: t("server.database.message"),
        };
      case "network":
        return {
          title: t("server.networkError.title"),
          message: t("server.networkError.message"),
        };
      case "server":
        return {
          title: t("server.serverCrash.title"),
          message: t("server.serverCrash.message"),
        };
      case "client":
        return {
          title: t("client.title"),
          message: t("client.message"),
        };
      default:
        return {
          title: t("server.title"),
          message: t("server.message"),
        };
    }
  };

  const { title: errorTitle, message: errorMessage } = getErrorContent();

  const cardSize =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-lg" : "max-w-md";
  const headerSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";
  const padding = size === "sm" ? "p-2" : size === "lg" ? "p-6" : "p-4";

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = "/";
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className={`flex min-h-[200px] flex-col items-center justify-center ${padding} ${className}`}
    >
      <Card
        className={`w-full ${cardSize} border-red-200 bg-white dark:bg-gray-800`}
      >
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">{getErrorIcon()}</div>
          <CardTitle
            className={`${headerSize} font-semibold text-gray-900 dark:text-gray-100`}
          >
            {errorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-700 dark:text-gray-300">
            {errorMessage}
          </p>

          {error && process.env.NODE_ENV === "development" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {(showRetry || showNavigation) && (
            <div className="space-y-2">
              {showRetry && (
                <Button
                  onClick={handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("server.actions.retry")}
                </Button>
              )}

              {showNavigation && (
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleGoBack} variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("server.actions.goBack")}
                  </Button>
                  <Button onClick={handleGoHome} variant="outline" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    {t("server.actions.goHome")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error fallback components for common scenarios
export function DatabaseErrorFallback({
  onRetry,
  ...props
}: Omit<ErrorFallbackProps, "type">) {
  return (
    <ErrorFallback
      type="database"
      showRetry={true}
      onRetry={onRetry}
      {...props}
    />
  );
}

export function NetworkErrorFallback({
  onRetry,
  ...props
}: Omit<ErrorFallbackProps, "type">) {
  return (
    <ErrorFallback
      type="network"
      showRetry={true}
      onRetry={onRetry}
      {...props}
    />
  );
}

export function ServerErrorFallback({
  onRetry,
  ...props
}: Omit<ErrorFallbackProps, "type">) {
  return (
    <ErrorFallback
      type="server"
      showRetry={true}
      showNavigation={true}
      onRetry={onRetry}
      {...props}
    />
  );
}

export function ClientErrorFallback({
  onRetry,
  ...props
}: Omit<ErrorFallbackProps, "type">) {
  return (
    <ErrorFallback
      type="client"
      showRetry={true}
      onRetry={onRetry}
      {...props}
    />
  );
}

// Simple loading error fallback
export function LoadingErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      type="client"
      size="sm"
      title="Loading Error"
      message="Failed to load content. Please try again."
      showRetry={true}
      onRetry={onRetry}
    />
  );
}

// Minimal error fallback for small components
export function MinimalErrorFallback({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-4 text-center">
      <div className="space-y-2">
        <AlertCircle className="mx-auto h-5 w-5 text-red-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Something went wrong
        </p>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
