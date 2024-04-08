"use client";

import type { DateRange } from "react-day-picker";
import * as React from "react";
import { RxCalendar } from "react-icons/rx";

import { format } from "@kdx/date-fns";
import { useCurrentLocale, useI18n } from "@kdx/locales/client";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

export function DateRangePicker({
  date,
  setDate,
  className,
}: {
  date: DateRange | undefined;
  setDate:
    | React.Dispatch<React.SetStateAction<DateRange | undefined>>
    | ((newDate: DateRange | undefined) => void);
  className?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const t = useI18n();
  const locale = useCurrentLocale();
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <RxCalendar className="mr-2 size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", locale)} -{" "}
                  {format(date.to, "LLL dd, y", locale)}
                </>
              ) : (
                format(date.from, "LLL dd, y", locale)
              )
            ) : (
              <span>{t("Pick a date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
