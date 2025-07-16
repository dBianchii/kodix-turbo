"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { AlertCircle, ArrowLeft, Bug, Home, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@kdx/ui/alert";
import { Badge } from "@kdx/ui/badge";
import { Button } from "@kdx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@kdx/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: "page" | "component" | "feature";
}

// Error logging utility
function logError(
  error: Error,
  errorInfo: ErrorInfo,
  errorId: string,
  level: string,
) {
  const errorReport = {
    errorId,
    level,
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error Boundary (${level})`);
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Error Report:", errorReport);
    console.groupEnd();
  }

  // In production, you might want to send to an error reporting service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === "production") {
    // sendToErrorReporting(errorReport);
  }
}

// Generate unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface ErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
  onRetry: () => void;
  onGoHome: () => void;
  onGoBack: () => void;
  showDetails?: boolean;
  level?: string;
}

function ErrorDisplay({
  error,
  errorInfo,
  retryCount,
  errorId,
  onRetry,
  onGoHome,
  onGoBack,
  showDetails = false,
  level = "component",
}: ErrorDisplayProps) {
  const t = useTranslations("api.errors");

  const getErrorSeverity = () => {
    if (level === "page") return "high";
    if (level === "feature") return "medium";
    return "low";
  };

  const getErrorTitle = () => {
    if (level === "page") return t("client.title");
    if (level === "feature") return "Feature Error";
    return "Component Error";
  };

  const getErrorMessage = () => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("chunk") || errorMessage.includes("loading")) {
      return t("client.chunkLoadError.message");
    }

    if (errorMessage.includes("hydration")) {
      return t("client.hydrationError.message");
    }

    if (errorMessage.includes("network")) {
      return t("server.networkError.message");
    }

    return t("client.message");
  };

  const severity = getErrorSeverity();
  const severityColor =
    severity === "high" ? "red" : severity === "medium" ? "orange" : "yellow";

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-4">
      <Card
        className={`w-full max-w-md border-${severityColor}-200 bg-white dark:bg-gray-800`}
      >
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className={`h-8 w-8 text-${severityColor}-500`} />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getErrorTitle()}
          </CardTitle>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              {level}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs text-${severityColor}-600`}
            >
              {severity} severity
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-700 dark:text-gray-300">
            {getErrorMessage()}
          </p>

          {retryCount > 0 && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription>
                Retry attempt {retryCount} of 3
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button onClick={onRetry} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("server.actions.retry")}
            </Button>

            {level === "page" && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={onGoBack} variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("server.actions.goBack")}
                </Button>
                <Button onClick={onGoHome} variant="outline" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  {t("server.actions.goHome")}
                </Button>
              </div>
            )}
          </div>

          {showDetails &&
            (process.env.NODE_ENV === "development" || level === "page") && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <span className="font-medium">Error ID:</span> {errorId}
                  </div>
                  <div>
                    <span className="font-medium">Retry Count:</span>{" "}
                    {retryCount}
                  </div>
                  <div>
                    <span className="font-medium">Level:</span> {level}
                  </div>
                  <div>
                    <span className="font-medium">Message:</span>
                    <pre className="mt-1 rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap dark:bg-gray-700">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <span className="font-medium">Stack:</span>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap dark:bg-gray-700">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = "component" } = this.props;

    this.setState({
      errorInfo,
      errorId: generateErrorId(),
    });

    // Log error
    logError(error, errorInfo, this.state.errorId, level);

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
    } else {
      // Max retries reached, suggest page refresh
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    const {
      children,
      fallback,
      showDetails = false,
      level = "component",
    } = this.props;
    const { hasError, error, errorInfo, retryCount, errorId } = this.state;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <ErrorDisplay
          error={error!}
          errorInfo={errorInfo}
          retryCount={retryCount}
          errorId={errorId}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoBack={this.handleGoBack}
          showDetails={showDetails}
          level={level}
        />
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for imperative error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // This will be caught by the nearest error boundary
    throw error;
  };
}
