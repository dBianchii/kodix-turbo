"use client";

import type { PopoverContentProps } from "@radix-ui/react-popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from ".";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TimePicker } from "./time-picker";

type DateTimePickerProps = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "default";
  disabledDate?: (date: Date) => boolean;
  side?: PopoverContentProps["side"];
};

/**
 * @deprecated This component is deprecated. Please use date-n-time instead
 */
export function DateTimePicker({
  date,
  setDate,
  onOpenChange,
  size,
  disabledDate,
  side,
}: DateTimePickerProps) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          size={size}
          variant="outline"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format.dateTime(date, "extensive")
          ) : (
            <span>{t("Pick a date")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side={side}>
        <div className="border-border border-t p-3">
          <TimePicker
            date={date}
            disabledDate={disabledDate}
            setDate={setDate}
          />
        </div>
        <Calendar
          disabled={disabledDate}
          initialFocus
          mode="single"
          onSelect={(newDate) => {
            if (newDate && date) {
              //only change day information and not time
              //keep time the same
              date.setFullYear(
                newDate.getFullYear(),
                newDate.getMonth(),
                newDate.getDate()
              );
              setDate(new Date(date));
              return;
            }
            setDate(newDate);
          }}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
}
