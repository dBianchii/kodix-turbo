"use client";

import type { PopoverContentProps } from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { cn } from "../.";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ScrollArea, ScrollBar } from "../scroll-area";

interface DateTimePickerProps<Clearable extends boolean = false> {
  date: Clearable extends true ? Date | null | undefined : Date | undefined;
  setDate?: Clearable extends true
    ? (date: Date | null | undefined) => void
    : (date: Date | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "default";
  disabledDate?: (date: Date) => boolean;
  side?: PopoverContentProps["side"];
  showClearButton?: Clearable;
  disabled?: boolean;
}

const today12h30 = new Date(new Date().setHours(12, 30, 0, 0));
export function DateTimePicker24h<Clearable extends boolean = false>({
  date,
  setDate,
  onOpenChange,
  size,
  disabled,
  disabledDate,
  side,
  showClearButton,
}: DateTimePickerProps<Clearable>) {
  if (disabledDate) throw new Error("disabledDate is not implemented yet");
  const t = useTranslations();
  const format = useFormatter();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate || !setDate) return;

    const newDate = new Date(selectedDate);
    newDate.setHours((date ?? today12h30).getHours());
    newDate.setMinutes((date ?? today12h30).getMinutes());
    setDate(newDate);
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const newDate = new Date(date ?? today12h30);
    if (type === "hour") {
      newDate.setHours(parseInt(value));
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    }
    setDate?.(newDate);
  };

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          size={size}
          variant="outline"
          className={cn(
            "w-fit min-w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format.dateTime(date, "extensive")
          ) : (
            <span>{t("Pick a date")}</span>
          )}
          {showClearButton && date && (
            <div
              className="ml-2 flex justify-end rounded-full p-1 hover:bg-secondary"
              onClick={(e) => {
                e.stopPropagation();
                //@ts-expect-error showClearButton is true, so we can still pass setDate
                setDate(null);
              }}
            >
              {/* @ts-expect-error showClearButton is true, so we can still pass setDate */}
              <X className="size-4" onClick={() => setDate(null)} />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        side={side}
        onWheel={(e) => {
          e.stopPropagation(); //reason: https://github.com/radix-ui/primitives/issues/1159
        }}
      >
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={handleDateSelect}
            initialFocus
            // disabled={(dateToCheck) => {
            //   if (!disabledDate) return false;

            //   const startOfDay = new Date(dateToCheck);
            //   startOfDay.setHours(0, 0, 0, 0);

            //   return disabledDate(startOfDay);
            // }}
          />
          <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    // disabled={disabledDate?.(new Date(date ?? 0))} //!!CHECK THIS
                    size="icon"
                    variant={
                      date && date.getHours() === hour ? "default" : "ghost"
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                    ref={(el) => {
                      if (el && date && date.getHours() === hour) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                    }}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute ? "default" : "ghost"
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                    ref={(el) => {
                      if (el && date && date.getMinutes() === minute) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                    }}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
