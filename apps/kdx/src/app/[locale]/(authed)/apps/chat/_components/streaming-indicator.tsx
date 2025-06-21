"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";

interface StreamingIndicatorProps {
  isVisible: boolean;
  onStop?: () => void;
  className?: string;
}

export function StreamingIndicator({
  isVisible,
  onStop,
  className,
}: StreamingIndicatorProps) {
  const t = useTranslations();
  const [shouldShow, setShouldShow] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Mostrar imediatamente quando streaming inicia
      setShouldShow(true);
      setIsAnimating(false);
    } else {
      // Delay suave quando streaming termina
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldShow(false);
        setIsAnimating(false);
      }, 500); // Delay de 500ms para transição natural

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldShow && !isAnimating) return null;

  return (
    <div
      className={cn(
        "group relative mb-6 flex w-full justify-start transition-all duration-500 ease-in-out",
        isVisible && !isAnimating
          ? "mb-6 max-h-20 opacity-100"
          : "mb-0 max-h-0 opacity-0",
        className,
      )}
      style={{
        overflow: "hidden",
      }}
    >
      <div className="bg-muted/30 relative max-w-[85%] rounded-lg px-4 py-2">
        <div className="flex items-center space-x-3">
          <Loader2
            className={cn(
              "text-muted-foreground h-4 w-4 transition-all duration-300",
              isVisible ? "animate-spin" : "animate-none opacity-50",
            )}
          />
          <span className="text-muted-foreground text-sm">
            {isVisible ? t("apps.chat.messages.generating") : "Concluído"}
          </span>
          {onStop && isVisible && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
              onClick={onStop}
            >
              {t("apps.chat.actions.stop")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
