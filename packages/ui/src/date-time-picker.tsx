"use client";

import type { PopoverContentProps } from "@radix-ui/react-popover";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";

import { format } from "@kdx/date-fns";
import { useCurrentLocale } from "@kdx/locales/client";
import { cn } from "@kdx/ui";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TimePicker } from "./time-picker";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "default";
  disabledDate?: (date: Date) => boolean;
  side?: PopoverContentProps["side"];
}

export function DateTimePicker({
  date,
  setDate,
  onOpenChange,
  size,
  disabledDate,
  side,
}: DateTimePickerProps) {
  const locale = useCurrentLocale();
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
          size={size}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP HH:mm:ss", locale)
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side={side}>
        <div className="border-t border-border p-3">
          <TimePicker
            setDate={setDate}
            date={date}
            disabledDate={disabledDate}
          />
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (newDate && date) {
              //only change day information and not time
              //keep time the same
              date.setFullYear(
                newDate.getFullYear(),
                newDate.getMonth(),
                newDate.getDate(),
              );
              setDate(new Date(date));
              return;
            }
            setDate(newDate);
          }}
          initialFocus
          disabled={disabledDate}
        />
      </PopoverContent>
    </Popover>
  );
}
