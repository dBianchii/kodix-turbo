"use client";

import { RxCalendar } from "react-icons/rx";

import { useFormatter } from "@kdx/locales/next-intl";
import { useTranslations } from "@kdx/locales/next-intl/client";
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
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabledPopover}
          size={size}
        >
          <RxCalendar className="mr-2 size-4" />
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
