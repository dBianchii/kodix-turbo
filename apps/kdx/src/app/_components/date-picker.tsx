"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { cn } from "@kdx/ui/utils";

export function DatePicker({
  date,
  setDate,
  disabledDate,
  disabledPopover,
  onDayClick,
  className,
}: {
  date?: Date | undefined;
  setDate?: (newDate: Date | undefined) => void;
  disabledDate?: (date: Date) => boolean;
  disabledPopover?: boolean;
  onDayClick?: (date: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabledPopover}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabledDate}
          onDayClick={onDayClick}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
