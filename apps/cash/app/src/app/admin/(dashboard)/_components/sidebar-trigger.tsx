"use client";

import { useOS } from "@kodix/ui/hooks/use-os";
import { Kbd, KbdGroup } from "@kodix/ui/kbd";
import { SidebarTrigger as SidebarTriggerComponent } from "@kodix/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kodix/ui/tooltip";

export function SidebarTrigger() {
  const os = useOS();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTriggerComponent />
      </TooltipTrigger>
      <TooltipContent>
        <KbdGroup>
          <Kbd>{os === "mac" ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}
