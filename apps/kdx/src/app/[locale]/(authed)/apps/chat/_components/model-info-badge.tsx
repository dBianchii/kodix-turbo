"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@kdx/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

import type {
  BadgeVariantType,
  LastMessageMetadata,
  ModelInfoBadgeSessionDataType,
} from "~/trpc/shared";
import { env } from "~/env";

/**
 * Normalizes a model name by removing version suffixes, dates, and other provider-specific identifiers.
 * This allows for a more reliable comparison between the configured model and the model actually used.
 * @param modelName - The model name to normalize.
 * @returns The normalized model name.
 */
const normalizeModelName = (modelName: string | undefined): string => {
  if (!modelName) return "";

  const patternsToRemove = [
    /\b(gpt-4o-mini|gpt-4-turbo)\b/g, // Specific aliases first
    /\./g, // General replacements
    /-\d{4}-\d{2}-\d{2}.*$/g,
    /-\d{8}.*$/g,
    /-\d{4}$/g,
    /-v\d+.*$/g,
    /-latest$/g,
    /-preview$/g,
    /-snapshot.*$/g,
    /-instruct.*$/g,
    /-chat.*$/g,
    /-beta.*$/g,
    /-alpha.*$/g,
    /-turbo-\d+.*$/g,
    /-\d+k.*$/g,
    /-\d+b.*$/g,
    /-fine-tuned.*$/g,
    /-ft-.*$/g,
    /\s+\d+\s+(mini|mini-?pro|pro|ultra)$/gi, // Remove version numbers and size indicators from display names
  ];

  const [firstPattern, ...remainingPatterns] = patternsToRemove;

  let normalized = modelName.toLowerCase();

  // Special handling for gpt-4o-mini and gpt-4-turbo, normalizing them to gpt-4o
  if (firstPattern?.test(normalized)) {
    normalized = "gpt-4o";
  }

  // Convert spaces to hyphens for all model names (generic normalization)
  normalized = normalized.replace(/\s+/g, "-");

  // General pattern replacements
  for (const pattern of remainingPatterns) {
    normalized = normalized.replace(pattern, (match) =>
      match === "." ? "-" : "",
    );
  }

  return normalized.trim();
};

interface ModelInfoBadgeProps {
  sessionData: ModelInfoBadgeSessionDataType;
  lastMessageMetadata: LastMessageMetadata | undefined;
}

export function ModelInfoBadge({
  sessionData,
  lastMessageMetadata,
}: ModelInfoBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    configuredModel,
    actualModel,
    hasResponse,
    hasModelMismatch,
    isCorrect,
    isWaitingValidation,
    status,
  } = useMemo(() => {
    // Parse config to get the actual model configuration
    const modelConfig = sessionData.aiModel.config as { 
      modelId?: string; 
      version?: string; 
      displayName?: string; 
    };
    
    const configured =
      sessionData.aiModel.universalModelId ??
      modelConfig?.modelId ??
      modelConfig?.version;

    const actual = lastMessageMetadata?.actualModelUsed;
    const hasResp = !!actual;

    const normalizedConfigured = normalizeModelName(configured);
    const normalizedActual = normalizeModelName(actual);

    const mismatch =
      hasResp &&
      !!normalizedConfigured &&
      normalizedConfigured !== "" &&
      normalizedActual !== normalizedConfigured;

    const correct =
      hasResp &&
      !!normalizedConfigured &&
      normalizedConfigured !== "" &&
      normalizedActual === normalizedConfigured;

    const waiting = !hasResp || mismatch;

    let statusResult: {
      icon: typeof AlertTriangle;
      color: string;
      variant: BadgeVariantType;
      label: string;
    };

    if (mismatch) {
      statusResult = {
        icon: AlertTriangle,
        color: "text-yellow-600",
        variant: "secondary",
        label: "Mismatch",
      };
    } else if (waiting) {
      statusResult = {
        icon: Clock,
        color: "text-slate-400",
        variant: "secondary",
        label: "Pending",
      };
    } else if (correct) {
      statusResult = {
        icon: CheckCircle2,
        color: "text-green-600",
        variant: "secondary",
        label: "Verified",
      };
    } else {
      // Fallback for an active, non-mismatched, non-waiting, non-correct state
      statusResult = {
        icon: CheckCircle2,
        color: "text-blue-600",
        variant: "secondary",
        label: "Active",
      };
    }

    return {
      configuredModel: configured,
      actualModel: actual,
      hasResponse: hasResp,
      hasModelMismatch: mismatch,
      isCorrect: correct,
      isWaitingValidation: waiting,
      status: statusResult,
    };
  }, [sessionData, lastMessageMetadata]);

  const StatusIcon = status.icon;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant={status.variant}
          className={`h-6 cursor-pointer px-2 text-xs font-medium transition-colors ${status.color} hover:bg-slate-100`}
        >
          <StatusIcon className="mr-1 h-3 w-3" />
          {status.label}
        </Badge>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="end" sideOffset={4}>
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-900">
            Model Verification
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Configured:</span>
              <code className="rounded bg-slate-100 px-1 text-slate-800">
                {configuredModel || "Not set"}
              </code>
            </div>

            {hasResponse && (
              <div className="flex justify-between">
                <span className="text-slate-600">Actually used:</span>
                <code
                  className={`rounded px-1 text-xs ${
                    hasModelMismatch
                      ? "bg-yellow-100 text-yellow-800"
                      : isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {actualModel}
                </code>
              </div>
            )}
          </div>

          <div
            className={`rounded p-2 text-xs ${
              hasModelMismatch
                ? "bg-yellow-50 text-yellow-700"
                : isWaitingValidation
                  ? "bg-slate-50 text-slate-600"
                  : isCorrect
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
            }`}
          >
            {hasModelMismatch && "Model mismatch detected"}
            {isWaitingValidation &&
              !hasModelMismatch &&
              !hasResponse &&
              "Send a message to verify"}
            {isWaitingValidation &&
              !hasModelMismatch &&
              hasResponse &&
              "Send a message to verify new model"}
            {isCorrect && "✓ Model is working as configured"}
            {!isWaitingValidation &&
              !isCorrect &&
              !hasModelMismatch &&
              hasResponse &&
              "Model responding normally"}
          </div>

          {lastMessageMetadata && (
            <div className="border-t pt-2 text-xs text-slate-500">
              Last checked:{" "}
              {new Date(lastMessageMetadata.timestamp).toLocaleTimeString()}
            </div>
          )}

          {env.NODE_ENV === "development" && (
            <div className="mt-2 border-t pt-2 text-xs text-slate-500">
              <details>
                <summary className="cursor-pointer hover:text-slate-700">
                  Debug Info
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="rounded bg-slate-50 p-2 text-xs">
                    <div className="mb-1 font-medium">Raw Data:</div>
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(
                        {
                          sessionData,
                          lastMessageMetadata,
                          normalizedConfigured: normalizeModelName(
                            sessionData.aiModel.universalModelId,
                          ),
                          normalizedActual: normalizeModelName(
                            lastMessageMetadata?.actualModelUsed,
                          ),
                          hasModelMismatch,
                          isCorrect,
                          isWaitingValidation,
                          hasResponse,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                  <div className="rounded bg-blue-50 p-2 text-xs">
                    <div className="mb-1 font-medium">Status Calculation:</div>
                    <div className="space-y-1">
                      <div>hasResponse: {String(hasResponse)}</div>
                      <div>
                        normalizedConfigured: "
                        {normalizeModelName(sessionData.aiModel.universalModelId)}"
                      </div>
                      <div>
                        normalizedActual: "
                        {normalizeModelName(
                          lastMessageMetadata?.actualModelUsed,
                        )}
                        "
                      </div>
                      <div>hasModelMismatch: {String(hasModelMismatch)}</div>
                      <div>isCorrect: {String(isCorrect)}</div>
                      <div>
                        isWaitingValidation: {String(isWaitingValidation)}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
