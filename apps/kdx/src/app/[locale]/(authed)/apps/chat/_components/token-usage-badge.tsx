"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@kdx/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
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
      <Popover>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Badge
                variant={indicator.variant}
                className="h-6 cursor-pointer px-2 text-xs font-medium transition-colors hover:opacity-80"
              >
                {indicator.emoji}
              </Badge>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>
            <p className="text-xs">
              {t("apps.chat.tokenUsage.tooltip", {
                used: usedTokens.toLocaleString(),
                total: maxTokens.toLocaleString(),
              })}
            </p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{indicator.emoji}</span>
              <h3 className="text-sm font-semibold">
                {t("apps.chat.tokenUsage.title")}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("apps.chat.tokenUsage.used")}:
                </span>
                <span className="font-medium">
                  {usedTokens.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("apps.chat.tokenUsage.limit")}:
                </span>
                <span className="font-medium">
                  {maxTokens.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("apps.chat.tokenUsage.percentage")}:
                </span>
                <span className="font-medium">{percentage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-secondary h-2 w-full rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage >= 90
                    ? "bg-destructive"
                    : percentage >= 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-muted-foreground text-xs">
              {t("apps.chat.tokenUsage.status")}:{" "}
              <span className="font-medium">{indicator.label}</span>
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
