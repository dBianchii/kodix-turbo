"use client";

import * as React from "react";
import { RxCalendar } from "react-icons/rx";

import { format } from "@kdx/date-fns";
import { useI18n } from "@kdx/locales/client";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

export function DatePicker({
  date,
  setDate,
  disabledDate,
  disabledPopover,
  onDayClick,
  className,
  size,
}: {
  date?: Date | undefined;
  setDate?: (newDate: Date | undefined) => void;
  disabledDate?: (date: Date) => boolean;
  disabledPopover?: boolean;
  onDayClick?: (date: Date | undefined) => void;
  className?: string;
  size?: "default" | "sm";
}) {
  const t = useI18n();
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
          size={size}
        >
          <RxCalendar className="mr-2 size-4" />
          {date ? format(date, "PPP") : <span>{t("Pick a date")}</span>}
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
