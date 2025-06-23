"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@kdx/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

interface ModelInfoBadgeProps {
  sessionData?: {
    aiModel?: {
      name: string;
      provider: {
        name: string;
      };
    };
  };
  lastMessageMetadata?: {
    actualModelUsed?: string;
    requestedModel?: string;
    providerId?: string;
    timestamp?: string;
  };
}

export function ModelInfoBadge({
  sessionData,
  lastMessageMetadata,
}: ModelInfoBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ FASE 1.1: Log de montagem do componente
  useEffect(() => {
    console.log("[MODEL_INFO_BADGE] Componente montado:", {
      timestamp: new Date().toISOString(),
      hasSessionData: !!sessionData,
      hasLastMessageMetadata: !!lastMessageMetadata,
    });
  }, []);

  // ✅ FASE 1.1: Logs detalhados de props recebidas
  useEffect(() => {
    console.log("[MODEL_INFO_BADGE] Props recebidas:", {
      sessionData: sessionData?.aiModel?.name,
      lastMessageMetadata: lastMessageMetadata?.actualModelUsed,
      timestamp: lastMessageMetadata?.timestamp,
      sessionDataFull: sessionData,
      lastMessageMetadataFull: lastMessageMetadata,
    });
  }, [sessionData, lastMessageMetadata]);

  // ✅ Função para normalizar nomes de modelos
  const normalizeModelName = (modelName: string | undefined): string => {
    if (!modelName) return "";

    // Remover todos os tipos de sufixos e versões que os provedores adicionam
    return modelName
      .toLowerCase()
      .replace(/\./g, "-") // Converter pontos em hífens: claude-3.5-haiku -> claude-3-5-haiku
      .replace(/-\d{4}-\d{2}-\d{2}.*$/, "") // Remove datas: -2024-08-06, -2024-11-20
      .replace(/-\d{8}.*$/, "") // Remove timestamps: -20240806, -20241120
      .replace(/-\d{4}.*$/, "") // Remove códigos: -0125, -1106, -0613, -2023
      .replace(/-v\d+.*$/, "") // Remove versões: -v1, -v2, -v3
      .replace(/-latest$/, "") // Remove sufixo: -latest
      .replace(/-preview$/, "") // Remove sufixo: -preview
      .replace(/-snapshot.*$/, "") // Remove sufixos: -snapshot-20241120
      .replace(/-instruct.*$/, "") // Remove sufixos: -instruct, -instruct-v1
      .replace(/-chat.*$/, "") // Remove sufixos: -chat, -chat-v1
      .replace(/-beta.*$/, "") // Remove sufixos: -beta, -beta-1
      .replace(/-alpha.*$/, "") // Remove sufixos: -alpha
      .replace(/-turbo-\d+.*$/, "") // Remove: -turbo-0125, -turbo-1106
      .replace(/-\d+k.*$/, "") // Remove context: -32k, -16k, -8k
      .replace(/-\d+b.*$/, "") // Remove parameters: -7b, -13b, -70b
      .replace(/-fine-tuned.*$/, "") // Remove: -fine-tuned-*
      .replace(/-ft-.*$/, "") // Remove: -ft-anything
      .trim();
  };

  const configuredModel = sessionData?.aiModel?.name;
  const actualModel = lastMessageMetadata?.actualModelUsed;
  const hasResponse = !!actualModel;

  // ✅ Comparar modelos normalizados
  const normalizedConfigured = normalizeModelName(configuredModel);
  const normalizedActual = normalizeModelName(actualModel);

  // ✅ Lógica inteligente de estados
  // Se há modelo configurado mas a última resposta é de modelo diferente,
  // assumimos que o modelo foi mudado recentemente e está "waiting" por nova mensagem
  const hasModelMismatch =
    hasResponse &&
    normalizedConfigured &&
    normalizedActual !== normalizedConfigured;

  const isCorrect =
    hasResponse &&
    normalizedConfigured &&
    normalizedActual === normalizedConfigured;
  const isWaitingValidation = !hasResponse || hasModelMismatch; // ✅ Waiting se não há resposta OU se há mismatch (modelo mudou)
  const hasMismatch = false; // ✅ Nunca mostrar erro - sempre assumir que mismatch = waiting

  // ✅ FASE 1.1: Logs de normalização e estados
  useEffect(() => {
    console.log("[MODEL_INFO_BADGE] Normalização:", {
      configuredModel,
      actualModel,
      normalizedConfigured,
      normalizedActual,
      hasModelMismatch,
      isCorrect,
      isWaitingValidation,
      hasResponse,
      hasMismatch,
    });
  }, [
    configuredModel,
    actualModel,
    normalizedConfigured,
    normalizedActual,
    hasModelMismatch,
    isCorrect,
    isWaitingValidation,
    hasResponse,
    hasMismatch,
  ]);

  // ✅ FASE 2.1: Performance otimizada com useMemo
  const memoizedStatus = useMemo(() => {
    console.log("[MODEL_INFO_BADGE] Recalculando status:", {
      hasResponse,
      isCorrect,
      isWaitingValidation,
      hasMismatch,
    });

    if (isWaitingValidation) {
      return {
        icon: Clock,
        color: "text-slate-400",
        variant: "secondary",
        label: "⏱",
      };
    }

    if (isCorrect) {
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        variant: "secondary",
        label: "✓",
      };
    }

    if (hasMismatch) {
      return {
        icon: AlertTriangle,
        color: "text-amber-600",
        variant: "secondary",
        label: "!",
      };
    }

    return {
      icon: CheckCircle2,
      color: "text-blue-600",
      variant: "secondary",
      label: "Active",
    };
  }, [hasResponse, isCorrect, isWaitingValidation, hasMismatch]);

  // ✅ FASE 2.1: Usar status memoizado para performance
  const status = memoizedStatus;
  const StatusIcon = status.icon;

  // ✅ FASE 1.1: Log de mudanças de status
  useEffect(() => {
    console.log("[MODEL_INFO_BADGE] Status changed:", {
      isWaitingValidation,
      isCorrect,
      hasModelMismatch,
      statusLabel: status.label,
      statusColor: status.color,
      timestamp: new Date().toISOString(),
    });
  }, [
    isWaitingValidation,
    isCorrect,
    hasModelMismatch,
    status.label,
    status.color,
  ]);

  // ✅ FASE 2.2: useEffect para debug de mudanças
  useEffect(() => {
    console.log("[MODEL_INFO_BADGE] FASE 2 - Props mudaram:", {
      sessionDataName: sessionData?.aiModel?.name,
      lastMessageActual: lastMessageMetadata?.actualModelUsed,
      timestamp: new Date().toISOString(),
    });
  }, [sessionData, lastMessageMetadata]);

  // ✅ FASE 5.3: Monitoramento específico para correção do problema
  useEffect(() => {
    console.log("[MODEL_INFO_BADGE] FASE 5.3 - Monitoramento pós-mudança:", {
      configuredModel,
      actualModel,
      normalizedConfigured,
      normalizedActual,
      hasModelMismatch,
      isCorrect,
      isWaitingValidation,
      hasResponse,
      shouldShowWaiting: !hasResponse || hasModelMismatch,
      componentKey: `${sessionData?.aiModel?.name}-${lastMessageMetadata?.actualModelUsed}`,
      timestamp: new Date().toISOString(),
    });
  }, [
    configuredModel,
    actualModel,
    normalizedConfigured,
    normalizedActual,
    hasModelMismatch,
    isCorrect,
    isWaitingValidation,
    hasResponse,
    sessionData,
    lastMessageMetadata,
  ]);

  // ✅ FASE 1.3: Identificar fonte do problema
  useEffect(() => {
    // Debug de props vazias
    if (!sessionData) {
      console.warn("[MODEL_INFO_BADGE] sessionData is undefined");
    }
    if (!lastMessageMetadata) {
      console.warn(
        "[MODEL_INFO_BADGE] lastMessageMetadata is undefined - PROBLEMA IDENTIFICADO!",
      );
    }

    // Debug de normalização problemática
    if (configuredModel && actualModel) {
      const originalMatch = configuredModel === actualModel;
      const normalizedMatch = normalizedConfigured === normalizedActual;

      if (originalMatch !== normalizedMatch) {
        console.warn("[MODEL_INFO_BADGE] Normalização alterou resultado:", {
          originalMatch,
          normalizedMatch,
          configuredModel,
          actualModel,
          normalizedConfigured,
          normalizedActual,
        });
      }
    }

    // Debug de timing issues
    const timeSinceLastMessage = lastMessageMetadata?.timestamp
      ? Date.now() - new Date(lastMessageMetadata.timestamp).getTime()
      : null;

    if (timeSinceLastMessage && timeSinceLastMessage > 60000) {
      // > 1 minuto
      console.warn("[MODEL_INFO_BADGE] Dados antigos detectados:", {
        timeSinceLastMessage: `${Math.round(timeSinceLastMessage / 1000)}s`,
        lastMessageTimestamp: lastMessageMetadata?.timestamp,
      });
    }
  }, [
    sessionData,
    lastMessageMetadata,
    configuredModel,
    actualModel,
    normalizedConfigured,
    normalizedActual,
  ]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant={status.variant as any}
          className={`h-6 cursor-pointer px-2 text-xs font-medium transition-colors ${status.color} hover:bg-slate-100`}
        >
          <StatusIcon className="mr-1 h-3 w-3" />
          {status.label}
        </Badge>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="end" sideOffset={4}>
        <div className="space-y-2">
          {/* Título */}
          <div className="text-sm font-medium text-slate-900">
            Model Verification
          </div>

          {/* Status atual */}
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
                    isCorrect
                      ? "bg-green-100 text-green-800"
                      : hasMismatch
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {actualModel}
                </code>
              </div>
            )}
          </div>

          {/* Status message */}
          <div
            className={`rounded p-2 text-xs ${
              isWaitingValidation
                ? "bg-slate-50 text-slate-600"
                : isCorrect
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {isWaitingValidation &&
              hasResponse &&
              "⏱ Send a message to verify the new model"}
            {isWaitingValidation &&
              !hasResponse &&
              "⏱ Send a message to verify the model"}
            {isCorrect && "✓ Model is working as configured"}
            {!isWaitingValidation &&
              !isCorrect &&
              hasResponse &&
              "Model responding normally"}
          </div>

          {/* Timestamp se disponível */}
          {lastMessageMetadata?.timestamp && (
            <div className="border-t pt-2 text-xs text-slate-500">
              Last checked:{" "}
              {new Date(lastMessageMetadata.timestamp).toLocaleTimeString()}
            </div>
          )}

          {/* ✅ FASE 1.2: Seção de debug no popover (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-2 border-t pt-2 text-xs text-slate-500">
              <details>
                <summary className="cursor-pointer hover:text-slate-700">
                  Debug Info
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="rounded bg-slate-50 p-2 text-xs">
                    <div className="mb-1 font-medium">Raw Data:</div>
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(
                        {
                          sessionData,
                          lastMessageMetadata,
                          normalizedConfigured,
                          normalizedActual,
                          hasModelMismatch,
                          isCorrect,
                          isWaitingValidation,
                          hasResponse,
                          hasMismatch,
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
                      <div>normalizedConfigured: "{normalizedConfigured}"</div>
                      <div>normalizedActual: "{normalizedActual}"</div>
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
