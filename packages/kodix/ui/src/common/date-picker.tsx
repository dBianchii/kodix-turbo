"use client";

import { Button } from "@kodix/ui/button";
import { Calendar } from "@kodix/ui/calendar";
import { cn } from "@kodix/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import { useFormatter, useTranslations } from "next-intl";
import { LuCalendar } from "react-icons/lu";

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
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabledPopover}
          size={size}
          variant={"outline"}
        >
          <LuCalendar className="mr-2 size-4" />
          {date ? (
            format.dateTime(date, {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          ) : (
            <span>{t("Pick a date")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          disabled={disabledDate}
          initialFocus
          mode="single"
          onDayClick={onDayClick}
          onSelect={setDate}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
}
