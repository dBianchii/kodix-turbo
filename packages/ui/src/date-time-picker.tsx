"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TimePicker } from "./time-picker";
import { cn } from "./utils";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "default";
}

export function DateTimePicker({
  date,
  setDate,
  onOpenChange,
  size,
}: TimePickerDemoProps) {
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
          {date ? format(date, "PPP HH:mm:ss") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
        <div className="border-t border-border p-3">
          <TimePicker setDate={setDate} date={date} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
