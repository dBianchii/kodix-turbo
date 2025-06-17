"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@kdx/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

interface TokenUsageBadgeProps {
  usedTokens: number;
  maxTokens: number;
}

export function TokenUsageBadge({
  usedTokens,
  maxTokens,
}: TokenUsageBadgeProps) {
  const t = useTranslations();

  // Calcular porcentagem de uso
  const percentage = Math.min((usedTokens / maxTokens) * 100, 100);

  // Determinar cor e emoji baseado na porcentagem
  const getIndicator = () => {
    if (percentage >= 90) {
      return {
        emoji: "🔴",
        variant: "destructive" as const,
        label: t("apps.chat.tokenUsage.high"),
      };
    } else if (percentage >= 70) {
      return {
        emoji: "🟡",
        variant: "secondary" as const,
        label: t("apps.chat.tokenUsage.medium"),
      };
    } else {
      return {
        emoji: "🟢",
        variant: "secondary" as const,
        label: t("apps.chat.tokenUsage.low"),
      };
    }
  };

  const indicator = getIndicator();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={indicator.variant}
            className="h-6 cursor-pointer px-2 text-xs font-medium transition-colors hover:opacity-80"
          >
            {indicator.emoji}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {t("apps.chat.tokenUsage.tooltip", {
              used: usedTokens.toLocaleString(),
              total: maxTokens.toLocaleString(),
            })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
