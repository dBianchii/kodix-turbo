import { useState } from "react";
import { cn } from "@kodix/ui";
import { Button } from "@kodix/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kodix/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import {
  LuCheck,
  LuCircleCheck,
  LuCircleOff,
  LuCircleSlash,
} from "react-icons/lu";
import { RxRadiobutton } from "react-icons/rx";

import type { todos } from "@kdx/db/schema";

type Status = typeof todos.$inferInsert.status;
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
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button size="sm" variant="outline">
            <StatusIcon className={"mr-2"} status={status} />
            {statusTxt}
            <span className="sr-only">Open status popover</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align={"start"} className="w-300 p-0" side="bottom">
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
                <StatusIcon className="mr-2" status={"TODO"} />
                Todo
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("INPROGRESS");
                  setOpen(false);
                }}
              >
                <StatusIcon className="mr-2" status={"INPROGRESS"} />
                In progress
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("INREVIEW");
                  setOpen(false);
                }}
              >
                <StatusIcon className="mr-2" status={"INREVIEW"} />
                In review
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("DONE");
                  setOpen(false);
                }}
              >
                <StatusIcon className="mr-2" status={"DONE"} />
                Done
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setStatus("CANCELED");
                  setOpen(false);
                }}
              >
                <StatusIcon className="mr-2" status={"CANCELED"} />
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
        <LuCircleCheck className={cn("size-4 text-foreground", className)} />
      );
    case "INPROGRESS":
      return (
        <RxRadiobutton className={cn("size-4 text-yellow-400", className)} />
      );
    case "INREVIEW":
      return (
        <LuCircleSlash className={cn("size-4 text-orange-400", className)} />
      );
    case "DONE":
      return <LuCheck className={cn("size-4 text-green-400", className)} />;
    case "CANCELED":
      return <LuCircleOff className={cn("size-4 text-red-400", className)} />;
    default:
      return null;
  }
}

export function StatusToText(status: Status) {
  switch (status) {
    case "TODO":
      return "Todo";
    case "INPROGRESS":
      return "In progress";
    case "INREVIEW":
      return "In review";
    case "DONE":
      return "Done";
    case "CANCELED":
      return "Canceled";
    default:
      return null;
  }
}
