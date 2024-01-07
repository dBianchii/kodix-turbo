"use client";

import { useState } from "react";
import {
  LuSignal,
  LuSignalHigh,
  LuSignalLow,
  LuSignalMedium,
} from "react-icons/lu";

import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { cn } from "@kdx/ui/utils";

/**
 * @description You can optionally input a button to overwrite the default button trigger.
 */
export function PriorityPopover({
  priority,
  setPriority,
  children,
}: {
  priority: Priority;
  setPriority: (priority: Priority) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const prioritiesArr: Priority[] = [0, 1, 2, 3];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {children ?? (
          <Button variant="ghost" size="sm">
            <PriorityIcon priority={priority} className="mr-2" />
            {PriorityToTxt(priority)}
            <span className="sr-only">Open priority popover</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Command>
          <CommandInput placeholder="Change priority..." />
          <CommandList
            onSelect={() => {
              setOpen(false);
            }}
          >
            <CommandGroup>
              {prioritiesArr.map((num) => (
                <CommandItem
                  key={num}
                  onSelect={() => {
                    setPriority(num);
                    setOpen(false);
                  }}
                >
                  <PriorityIcon priority={num} className="mr-2" />
                  {PriorityToTxt(num)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * None, Low, Medium, High
 */
export type Priority = 0 | 1 | 2 | 3;
export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  switch (priority) {
    case 0:
      return <LuSignalLow className={cn("h-4 w-4 text-white/60", className)} />;
    case 1:
      return (
        <LuSignalMedium className={cn("h-4 w-4 text-green-400", className)} />
      );
    case 2:
      return (
        <LuSignalHigh className={cn("h-4 w-4 text-yellow-400", className)} />
      );
    case 3:
      return <LuSignal className={cn("h-4 w-4 text-red-400", className)} />;
  }
}

export function PriorityToTxt(priority: Priority) {
  switch (priority) {
    case 0:
      return "None";
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
  }
}
