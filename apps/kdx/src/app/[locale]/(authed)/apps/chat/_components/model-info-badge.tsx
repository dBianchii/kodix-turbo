"use client";

import { useState } from "react";
import { Bot, Info } from "lucide-react";

import { Badge } from "@kdx/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

interface ModelInfoBadgeProps {
  sessionData?: {
    aiModel?: {
      name: string;
      provider: {
        name: string;
      };
      config?: any;
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

  const configuredModel = sessionData?.aiModel?.name || "Modelo padrão";
  const provider = sessionData?.aiModel?.provider.name || "Provider";
  const actualModel = lastMessageMetadata?.actualModelUsed;
  const requestedModel = lastMessageMetadata?.requestedModel;

  // ✅ Usar modelo real quando disponível, senão usar configurado
  const displayModel = actualModel || configuredModel;
  const displayProvider = provider;

  // Função para normalizar nomes de modelos (remover versões/datas)
  const normalizeModelName = (modelName: string) => {
    if (!modelName) return "";

    // Remover sufixos de data/versão comuns da OpenAI
    return modelName
      .replace(/-\d{4}-\d{2}-\d{2}$/, "") // Remove -YYYY-MM-DD (ex: -2024-04-09)
      .replace(/-\d{4}\d{2}\d{2}$/, "") // Remove -YYYYMMDD (ex: -20240409)
      .replace(/-\d{4}$/, "") // Remove -YYYY (ex: -0125, -1106)
      .replace(/-v\d+(\.\d+)*$/, "") // Remove -v1.0, -v2.1, etc
      .replace(/-preview$/, "") // Remove -preview
      .replace(/-latest$/, "") // Remove -latest
      .replace(/-instruct$/, "") // Remove -instruct
      .toLowerCase();
  };

  // Determinar se há inconsistência REAL (não apenas versões diferentes)
  const hasRealInconsistency =
    actualModel &&
    requestedModel &&
    normalizeModelName(actualModel) !== normalizeModelName(requestedModel);

  // Determinar se é apenas diferença de versão
  const isVersionDifference =
    actualModel &&
    requestedModel &&
    actualModel !== requestedModel &&
    normalizeModelName(actualModel) === normalizeModelName(requestedModel);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={`flex cursor-pointer items-center gap-1 text-xs ${
            hasRealInconsistency ? "border-yellow-500 text-yellow-500" : ""
          } ${actualModel ? "border-green-500 text-green-600" : ""}`}
        >
          <Bot className="h-3 w-3" />
          {displayProvider} - {displayModel}
          <Info className="h-3 w-3 opacity-70" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Informações do Modelo</h4>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Configurado:</span>
              <div className="text-muted-foreground ml-2">
                {provider} - {configuredModel}
              </div>
            </div>

            {requestedModel && (
              <div>
                <span className="font-medium">Solicitado à API:</span>
                <div className="text-muted-foreground ml-2 font-mono text-xs">
                  {requestedModel}
                </div>
              </div>
            )}

            {actualModel ? (
              <div>
                <span className="font-medium">Real (retornado pela API):</span>
                <div
                  className={`ml-2 font-mono text-xs ${
                    hasRealInconsistency ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {actualModel}
                </div>
                {hasRealInconsistency && (
                  <div className="mt-1 text-xs text-yellow-600">
                    ⚠️ Modelo diferente do solicitado
                  </div>
                )}
                {isVersionDifference && (
                  <div className="mt-1 text-xs text-blue-600">
                    ℹ️ Versão específica (normal)
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">
                Envie uma mensagem para ver o modelo real usado
              </div>
            )}

            {lastMessageMetadata?.timestamp && (
              <div className="text-muted-foreground border-t pt-2 text-xs">
                Última verificação:{" "}
                {new Date(lastMessageMetadata.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
