"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Database,
  Home,
  MessageSquare,
  RefreshCw,
  Server,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";
import { Separator } from "@kdx/ui/separator";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

type ErrorType =
  | "server_crash"
  | "database_error"
  | "network_error"
  | "timeout_error"
  | "render_error"
  | "chunk_load_error"
  | "hydration_error"
  | "maintenance_mode"
  | "generic";

interface ErrorInfo {
  type: ErrorType;
  isServerError: boolean;
  hasRecovery: boolean;
  estimatedRecoveryTime?: string;
}

// Error detection and classification
function detectErrorType(error: Error): ErrorInfo {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || "";

  // Server-side errors
  if (
    errorMessage.includes("server components render") ||
    errorMessage.includes("internal server error") ||
    errorStack.includes("react-server-dom")
  ) {
    return {
      type: "server_crash",
      isServerError: true,
      hasRecovery: true,
      estimatedRecoveryTime: "2-5 minutes",
    };
  }

  // Database connection errors
  if (
    errorMessage.includes("database") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("mysql") ||
    errorMessage.includes("prisma") ||
    errorMessage.includes("drizzle")
  ) {
    return {
      type: "database_error",
      isServerError: true,
      hasRecovery: true,
      estimatedRecoveryTime: "30 seconds - 2 minutes",
    };
  }

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection refused") ||
    errorMessage.includes("net::err")
  ) {
    return {
      type: "network_error",
      isServerError: false,
      hasRecovery: true,
    };
  }

  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return {
      type: "timeout_error",
      isServerError: true,
      hasRecovery: true,
    };
  }

  // Chunk loading errors (client-side)
  if (
    errorMessage.includes("chunk") ||
    errorMessage.includes("loading") ||
    errorMessage.includes("import")
  ) {
    return {
      type: "chunk_load_error",
      isServerError: false,
      hasRecovery: true,
    };
  }

  // Hydration errors
  if (errorMessage.includes("hydration") || errorMessage.includes("hydrate")) {
    return {
      type: "hydration_error",
      isServerError: false,
      hasRecovery: true,
    };
  }

  // Maintenance mode
  if (errorMessage.includes("maintenance") || errorMessage.includes("503")) {
    return {
      type: "maintenance_mode",
      isServerError: true,
      hasRecovery: false,
    };
  }

  // Generic server error
  if (errorMessage.includes("500") || errorStack.includes("server")) {
    return {
      type: "server_crash",
      isServerError: true,
      hasRecovery: true,
    };
  }

  // Default to generic
  return {
    type: "generic",
    isServerError: false,
    hasRecovery: true,
  };
}

// Server health check
async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch("/api/health", {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Error icon mapping
function getErrorIcon(type: ErrorType) {
  const iconProps = { className: "h-8 w-8 text-red-500" };

  switch (type) {
    case "database_error":
      return <Database {...iconProps} />;
    case "network_error":
      return <Wifi {...iconProps} />;
    case "server_crash":
    case "timeout_error":
    case "maintenance_mode":
      return <Server {...iconProps} />;
    default:
      return <AlertCircle {...iconProps} />;
  }
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const t = useTranslations("api.errors");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>(() =>
    detectErrorType(error),
  );
  const [isRecovering, setIsRecovering] = useState(false);
  const [serverHealth, setServerHealth] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check server health periodically for server errors
  useEffect(() => {
    if (errorInfo.isServerError) {
      const checkHealth = async () => {
        const isHealthy = await checkServerHealth();
        setServerHealth(isHealthy);

        // Auto-retry if server is healthy and we haven't retried too many times
        if (isHealthy && retryCount < 3 && errorInfo.hasRecovery) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            handleRetry();
          }, 2000);
        }
      };

      checkHealth();

      const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [errorInfo.isServerError, retryCount, errorInfo.hasRecovery]);

  const handleRetry = async () => {
    setIsRecovering(true);

    try {
      // For server errors, check health first
      if (errorInfo.isServerError) {
        const isHealthy = await checkServerHealth();
        if (!isHealthy) {
          setIsRecovering(false);
          return;
        }
      }

      // Re-detect error type in case it changed
      const newErrorInfo = detectErrorType(error);
      setErrorInfo(newErrorInfo);

      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      reset();
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      setIsRecovering(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getErrorContent = () => {
    const errorKey = errorInfo.type === "generic" ? "server" : errorInfo.type;
    const category = errorInfo.isServerError ? "server" : "client";

    // Handle specific error types
    if (errorInfo.type === "database_error") {
      return {
        title: t("server.database.title"),
        subtitle: t("server.database.subtitle"),
        message: t("server.database.message"),
        icon: <Database className="h-8 w-8 text-blue-500" />,
      };
    }

    if (errorInfo.type === "network_error") {
      return {
        title: t("server.networkError.title"),
        subtitle: t("server.networkError.subtitle"),
        message: t("server.networkError.message"),
        icon: <Wifi className="h-8 w-8 text-orange-500" />,
      };
    }

    if (errorInfo.type === "server_crash") {
      return {
        title: t("server.serverCrash.title"),
        subtitle: t("server.serverCrash.subtitle"),
        message: t("server.serverCrash.message"),
        icon: <Server className="h-8 w-8 text-red-500" />,
      };
    }

    if (errorInfo.type === "timeout_error") {
      return {
        title: t("server.timeoutError.title"),
        subtitle: t("server.timeoutError.subtitle"),
        message: t("server.timeoutError.message"),
        icon: <Server className="h-8 w-8 text-yellow-500" />,
      };
    }

    if (errorInfo.type === "maintenance_mode") {
      return {
        title: t("server.maintenanceMode.title"),
        subtitle: t("server.maintenanceMode.subtitle"),
        message: t("server.maintenanceMode.message"),
        icon: <Server className="h-8 w-8 text-blue-500" />,
      };
    }

    if (errorInfo.type === "chunk_load_error") {
      return {
        title: t("client.chunkLoadError.title"),
        subtitle: t("client.chunkLoadError.subtitle"),
        message: t("client.chunkLoadError.message"),
        icon: <RefreshCw className="h-8 w-8 text-purple-500" />,
      };
    }

    if (errorInfo.type === "hydration_error") {
      return {
        title: t("client.hydrationError.title"),
        subtitle: t("client.hydrationError.subtitle"),
        message: t("client.hydrationError.message"),
        icon: <RefreshCw className="h-8 w-8 text-indigo-500" />,
      };
    }

    // Default to render error for server issues
    return {
      title: t("server.renderError.title"),
      subtitle: t("server.renderError.subtitle"),
      message: t("server.renderError.message"),
      icon: <AlertCircle className="h-8 w-8 text-red-500" />,
    };
  };

  const { title, subtitle, message, icon } = getErrorContent();

  return (
    <html>
      <body className="bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            {/* Main Error Card */}
            <Card className="border-red-200 bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">{icon}</div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-gray-700 dark:text-gray-300">
                  {message}
                </p>

                {/* Server Health Status */}
                {errorInfo.isServerError && (
                  <div className="flex items-center justify-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        serverHealth === null
                          ? "bg-gray-400"
                          : serverHealth
                            ? "bg-green-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {serverHealth === null
                        ? "Checking server..."
                        : serverHealth
                          ? "Server is responding"
                          : "Server is down"}
                    </span>
                  </div>
                )}

                {/* Estimated Recovery Time */}
                {errorInfo.estimatedRecoveryTime && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {t("server.serverCrash.estimatedTime")}:{" "}
                      {errorInfo.estimatedRecoveryTime}
                    </Badge>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-3">
                  {errorInfo.hasRecovery && (
                    <Button
                      onClick={handleRetry}
                      disabled={isRecovering}
                      className="w-full"
                      variant="default"
                    >
                      {isRecovering ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          {t("recovery.automatic")}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t("server.actions.retry")}
                        </>
                      )}
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleRefresh} variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("server.actions.refresh")}
                    </Button>
                    <Button onClick={handleGoBack} variant="outline" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t("server.actions.goBack")}
                    </Button>
                  </div>

                  <Button
                    onClick={handleGoHome}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {t("server.actions.goHome")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <h3 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                  {t("server.tips.title")}
                </h3>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• {t("server.tips.refresh")}</li>
                  <li>• {t("server.tips.wait")}</li>
                  {!errorInfo.isServerError && (
                    <li>• {t("server.tips.different")}</li>
                  )}
                  <li>• {t("server.tips.contact")}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <Card className="border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Technical Details (Development)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Error Type:</span>{" "}
                      {errorInfo.type}
                    </div>
                    <div>
                      <span className="font-medium">Is Server Error:</span>{" "}
                      {errorInfo.isServerError.toString()}
                    </div>
                    <div>
                      <span className="font-medium">Has Recovery:</span>{" "}
                      {errorInfo.hasRecovery.toString()}
                    </div>
                    <div>
                      <span className="font-medium">Retry Count:</span>{" "}
                      {retryCount}
                    </div>
                    {error.digest && (
                      <div>
                        <span className="font-medium">Error Digest:</span>{" "}
                        {error.digest}
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="font-medium">Error Message:</span>
                      <pre className="mt-1 rounded bg-gray-200 p-2 text-xs whitespace-pre-wrap dark:bg-gray-700">
                        {error.message}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
