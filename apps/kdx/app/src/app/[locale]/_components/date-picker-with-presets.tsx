"use client";

import { useState } from "react";
import { Button } from "@kodix/ui/button";
import { Calendar } from "@kodix/ui/calendar";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kodix/ui/command";
import { cn } from "@kodix/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import { addDays } from "date-fns";
import { useFormatter, useTranslations } from "next-intl";
import { LuCalendar, LuChevronDown, LuX } from "react-icons/lu";

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
  const t = useTranslations();

  const commands = [
    {
      text: t("Today"),
      value: "0",
    },
    {
      text: t("Tomorrow"),
      value: "1",
    },
    {
      text: t("In 3 days"),
      value: "3",
    },
    {
      text: t("In a week"),
      value: "7",
    },
    {
      text: t("In one month"),
      value: "30",
    },
    {
      text: t("In one year"),
      value: "365",
    },
  ];

  const [open, setOpen] = useState(false);
  const format = useFormatter();
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger>
        {children ?? (
          <Button size="sm" variant="ghost">
            <DatePickerIcon className="mr-2" date={date} />
            {date
              ? format.dateTime(date, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : t("Pick a date")}
            {date && (
              // biome-ignore lint/a11y/noStaticElementInteractions: Fix me
              // biome-ignore lint/a11y/useKeyWithClickEvents: Fix me
              // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Fix me
              <span
                className="ml-2 rounded-full transition-colors hover:bg-primary/90 hover:text-background"
                onClick={() => {
                  setDate(undefined);
                }}
              >
                <LuX className="size-4" />
              </span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="flex flex-col space-y-2 p-2">
        <Popover>
          <PopoverTrigger>
            <Button className="w-full justify-between" variant="outline">
              {t("Select")}...
              <LuChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0" side="bottom">
            <Command
              onValueChange={(value) =>
                setDate(addDays(new Date(), Number.parseInt(value, 10)))
              }
            >
              <CommandInput placeholder="Choose day..." />
              <CommandList>
                <CommandGroup>
                  {commands.map((command) => (
                    <CommandItem
                      key={command.value}
                      onSelect={() => {
                        setDate(
                          addDays(
                            new Date(),
                            Number.parseInt(command.value, 10),
                          ),
                        );
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
            initialFocus
            mode="single"
            onSelect={setDate}
            selected={date}
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
  if (date === undefined)
    return (
      <LuCalendar className={cn("size-4 text-foreground/70", className)} />
    );
  if (new Date() > date)
    return <LuCalendar className={cn("size-4 text-red-500", className)} />;
  return <LuCalendar className={cn("size-4 text-foreground", className)} />;
}
