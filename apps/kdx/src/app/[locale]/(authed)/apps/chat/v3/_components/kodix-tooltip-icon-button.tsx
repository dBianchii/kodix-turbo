"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui/tooltip";

export type KodixTooltipIconButtonProps = ComponentPropsWithoutRef<
  typeof Button
> & {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
};

export const KodixTooltipIconButton = forwardRef<
  HTMLButtonElement,
  KodixTooltipIconButtonProps
>(({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            {...rest}
            className={cn(className)}
            ref={ref}
          >
            {children}
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

KodixTooltipIconButton.displayName = "KodixTooltipIconButton";
