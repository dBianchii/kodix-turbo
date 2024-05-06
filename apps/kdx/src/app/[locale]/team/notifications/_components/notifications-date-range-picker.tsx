"use client";

import type { DateRange } from "react-day-picker";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RxCalendar } from "react-icons/rx";

import type { ButtonProps } from "@kdx/ui/button";
import { addDays, format } from "@kdx/date-fns";
import { useCurrentLocale, useI18n } from "@kdx/locales/client";
import { cn } from "@kdx/ui";
import { Button } from "@kdx/ui/button";
import { Calendar } from "@kdx/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";

interface NotificationsDateRangePickerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /**
   * The selected date range.
   * @default undefined
   * @type DateRange
   * @example { from: new Date(), to: new Date() }
   */
  dateRange?: DateRange;

  /**
   * The number of days to display in the date range picker.
   * @default undefined
   * @type number
   * @example 7
   */
  dayCount?: number;

  /**
   * The placeholder text of the calendar trigger button.
   * @default "Pick a date"
   * @type string | undefined
   */
  placeholder?: string;

  /**
   * The variant of the calendar trigger button.
   * @default "outline"
   * @type "default" | "outline" | "secondary" | "ghost"
   */
  triggerVariant?: Exclude<ButtonProps["variant"], "destructive" | "link">;

  /**
   * The size of the calendar trigger button.
   * @default "default"
   * @type "default" | "sm" | "lg"
   */
  triggerSize?: Exclude<ButtonProps["size"], "icon">;

  /**
   * The class name of the calendar trigger button.
   * @default undefined
   * @type string
   */
  triggerClassName?: string;
}

//? This isnt exactly a stock range picker, because it interacts with the URL query params. Maybe this can be moved elsewhere in the future
export function NotificationsDateRangePicker({
  dateRange,
  dayCount,
  placeholder,
  triggerVariant = "outline",
  triggerSize = "default",
  triggerClassName,
  className,
  ...props
}: NotificationsDateRangePickerProps) {
  const router = useRouter();
  const t = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  placeholder = placeholder ?? t("Pick a date");

  const [from, to] = React.useMemo(() => {
    let fromDay: Date | undefined = searchParams.get("from")
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new Date(searchParams.get("from")!)
      : undefined;
    let toDay: Date | undefined = searchParams.get("to")
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new Date(searchParams.get("to")!)
      : undefined;

    if (dateRange) {
      fromDay = dateRange.from;
      toDay = dateRange.to;
    } else if (dayCount) {
      toDay = new Date();
      fromDay = addDays(toDay, -dayCount);
    }

    return [fromDay, toDay];
  }, [dateRange, dayCount, searchParams]);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  });
  const locale = useCurrentLocale();
  // Update query string
  React.useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (date?.from) {
      newSearchParams.set("from", format(date.from, "yyyy-MM-dd", locale));
    } else {
      newSearchParams.delete("from");
    }

    if (date?.to) {
      newSearchParams.set("to", format(date.to, "yyyy-MM-dd", locale));
    } else {
      newSearchParams.delete("to");
    }

    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date?.from, date?.to]);

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={cn(
              "w-full justify-start truncate text-left font-normal",
              !date && "text-muted-foreground",
              triggerClassName,
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
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", className)} {...props}>
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
