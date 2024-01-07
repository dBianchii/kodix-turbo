"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { RxCalendar, RxChevronDown, RxCross2 } from "react-icons/rx";

import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { cn } from "@kdx/ui/utils";

export function DatePickerWithPresets({
  date,
  setDate,
  children,
}: {
  date: Date | undefined;
  setDate:
    | React.Dispatch<React.SetStateAction<Date | undefined>>
    | ((newDate: Date | undefined) => void);
  children?: React.ReactNode;
}) {
  const commands = [
    {
      text: "Today",
      value: "0",
    },
    {
      text: "Tomorrow",
      value: "1",
    },
    {
      text: "In 3 days",
      value: "3",
    },
    {
      text: "In a week",
      value: "7",
    },
    {
      text: "In one month",
      value: "30",
    },
    {
      text: "In one year",
      value: "365",
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {children ?? (
          <Button variant="ghost" size="sm">
            <DatePickerIcon date={date} className="mr-2" />
            {date
              ? format(new Date(date.toString() ?? ""), "PPP").split(",")[0]
              : "Pick a date"}
            {date && (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <span
                onClick={() => {
                  setDate(undefined);
                }}
                className="ml-2 rounded-full transition-colors hover:bg-primary/90 hover:text-background"
              >
                <RxCross2 className="h-4 w-4 " />
              </span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="flex flex-col space-y-2 p-2" align="start">
        <Popover>
          <PopoverTrigger>
            <Button variant="outline" className="w-full justify-between">
              Select...
              <RxChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" side="bottom">
            <Command
              onValueChange={(value) =>
                setDate(addDays(new Date(), parseInt(value)))
              }
            >
              <CommandInput placeholder="Choose day..." />
              <CommandList>
                <CommandGroup>
                  {commands.map((command) => (
                    <CommandItem
                      key={command.value}
                      onSelect={() => {
                        setDate(addDays(new Date(), parseInt(command.value)));
                        setOpen(false);
                      }}
                    >
                      {command.text}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DatePickerIcon({
  date,
  className,
}: {
  date: Date | undefined;
  className?: string;
}) {
  if (date === undefined) {
    return (
      <RxCalendar className={cn("h-4 w-4 text-foreground/70", className)} />
    );
  } else if (new Date() > date) {
    return <RxCalendar className={cn("h-4 w-4 text-red-500", className)} />;
  } else {
    return <RxCalendar className={cn("h-4 w-4 text-foreground", className)} />;
  }
}
