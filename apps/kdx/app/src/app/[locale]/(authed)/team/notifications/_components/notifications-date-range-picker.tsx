"use client";

import type { ButtonProps } from "@kodix/ui/button";
import type { DateRange } from "react-day-picker";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@kodix/ui/button";
import { Calendar } from "@kodix/ui/calendar";
import { cn } from "@kodix/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@kodix/ui/popover";
import { addDays, format as datefnsFormat } from "date-fns";
import { useFormatter, useTranslations } from "next-intl";
import { LuCalendar } from "react-icons/lu";

import { usePathname, useRouter } from "~/i18n/routing";

interface NotificationsDateRangePickerProps
  extends React.ComponentProps<typeof PopoverContent> {
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
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  placeholder = placeholder ?? t("Pick a date");

  const [from, to] = useMemo(() => {
    let fromDay: Date | undefined = searchParams.get("from")
      ? // biome-ignore lint/style/noNonNullAssertion: <biome migration>
        new Date(searchParams.get("from")!)
      : undefined;
    let toDay: Date | undefined = searchParams.get("to")
      ? // biome-ignore lint/style/noNonNullAssertion: <biome migration>
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

  const [date, setDate] = useState<DateRange | undefined>({
    from,
    to,
  });
  // Update query string
  // biome-ignore lint/correctness/useExhaustiveDependencies: Fix me
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (date?.from) {
      newSearchParams.set("from", datefnsFormat(date.from, "yyyy-MM-dd"));
    } else {
      newSearchParams.delete("from");
    }

    if (date?.to) {
      newSearchParams.set("to", datefnsFormat(date.to, "yyyy-MM-dd"));
    } else {
      newSearchParams.delete("to");
    }

    router.push(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
  }, [date?.from, date?.to]);
  const formatT = useFormatter();
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start truncate text-left font-normal",
              !date && "text-muted-foreground",
              triggerClassName,
            )}
            size={triggerSize}
            variant={triggerVariant}
          >
            <LuCalendar className="mr-2 size-4" />
            {date?.from ? (
              // biome-ignore lint/style/noNestedTernary: Not my code lol
              date.to ? (
                <>
                  {formatT.dateTime(date.from, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {formatT.dateTime(date.to, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              ) : (
                formatT.dateTime(date.from, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", className)} {...props}>
          <Calendar
            defaultMonth={date?.from}
            initialFocus
            mode="range"
            numberOfMonths={2}
            onSelect={setDate}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
