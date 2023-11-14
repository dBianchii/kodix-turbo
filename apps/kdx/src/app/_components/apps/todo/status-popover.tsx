"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  CircleDot,
  CircleOff,
  CircleSlash,
} from "lucide-react";

import type { Status } from "@kdx/db";
import {
  Button,
  cn,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kdx/ui";

/**
 * @description You can optionally input a button to overwrite the default button trigger.
 */
export function StatusPopover({
  status,
  setStatus,
  children,
}: {
  status: Status;
  setStatus: (status: Status) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const statusTxt = StatusToText(status);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <StatusIcon status={status} className={"mr-2"} />
            {statusTxt}
            <span className="sr-only">Open status popover</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Command>
          <CommandInput placeholder="Change status..." />
          <CommandList
            onSelect={() => {
              setOpen(false);
            }}
          >
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setStatus("TODO");
                  setOpen(false);
                }}
              >
                <StatusIcon status={"TODO"} className="mr-2" />
                Todo
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("INPROGRESS");
                  setOpen(false);
                }}
              >
                <StatusIcon status={"INPROGRESS"} className="mr-2" />
                In progress
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("INREVIEW");
                  setOpen(false);
                }}
              >
                <StatusIcon status={"INREVIEW"} className="mr-2" />
                In review
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("DONE");
                  setOpen(false);
                }}
              >
                <StatusIcon status={"DONE"} className="mr-2" />
                Done
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("CANCELED");
                  setOpen(false);
                }}
              >
                <StatusIcon status={"CANCELED"} className="mr-2" />
                Canceled
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function StatusIcon({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  switch (status) {
    case "TODO":
      return (
        <CheckCircle2 className={cn("text-foreground h-4 w-4", className)} />
      );
    case "INPROGRESS":
      return <CircleDot className={cn("h-4 w-4 text-yellow-400", className)} />;
    case "INREVIEW":
      return (
        <CircleSlash className={cn("h-4 w-4 text-orange-400", className)} />
      );
    case "DONE":
      return <Check className={cn("h-4 w-4 text-green-400", className)} />;
    case "CANCELED":
      return <CircleOff className={cn("h-4 w-4 text-red-400", className)} />;
  }
}

export function StatusToText(status: Status) {
  switch (status) {
    case "TODO":
      return "Todo";
      break;
    case "INPROGRESS":
      return "In progress";
      break;
    case "INREVIEW":
      return "In review";
      break;
    case "DONE":
      return "Done";
      break;
    case "CANCELED":
      return "Canceled";
      break;
  }
}
