/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <biome migration> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <biome migration> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <biome migration> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <biome migration> */

/**
 * Shadcn Datetime Picker with support for timezone, date and time selection, minimum and maximum date limits, and 12-hour format...
 * Check out the live demo at https://shadcn-datetime-picker-pro.vercel.app/
 * Find the latest source code at https://github.com/huybuidac/shadcn-datetime-picker
 */
"use client";

import type { Matcher } from "react-day-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addHours,
  addMonths,
  formatDate as datefnsFormat,
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfYear,
  getMonth,
  getYear,
  parse,
  setHours,
  setMilliseconds,
  setMinutes,
  setMonth as setMonthFns,
  setSeconds,
  setYear,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfYear,
  subHours,
  subMonths,
} from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Clock,
  XCircle,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { DayPicker, TZDate } from "react-day-picker";
import { enUS, ptBR } from "react-day-picker/locale";
import { cn } from ".";

import { Button, buttonVariants } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

export type CalendarProps = Omit<
  React.ComponentProps<typeof DayPicker>,
  "mode"
>;

const AM_VALUE = 0;
const PM_VALUE = 1;

export interface DateTimePickerProps {
  /**
   * The modality of the popover. When set to true, interaction with outside elements will be disabled and only popover content will be visible to screen readers.
   * If you want to use the datetime picker inside a dialog, you should set this to true.
   * @default false
   */
  modal?: boolean;
  /**
   * The datetime value to display and control.
   */
  value: Date | undefined;
  /**
   * Callback function to handle datetime changes.
   */
  onChange: (date: Date | undefined) => void;
  /**
   * The minimum datetime value allowed.
   * @default undefined
   */
  min?: Date;
  /**
   * The maximum datetime value allowed.
   */
  max?: Date;
  /**
   * The timezone to display the datetime in, based on the date-fns.
   * For a complete list of valid time zone identifiers, refer to:
   * https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   * @default undefined
   */
  timezone?: string;
  /**
   * Whether the datetime picker is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether to show the time picker.
   * @default false
   */
  hideTime?: boolean;
  /**
   * Whether to use 12-hour format.
   * @default false
   */
  use12HourFormat?: boolean;
  /**
   * Whether to show the clear button.
   * @default false
   */
  clearable?: boolean;
  /**
   * Custom class names for the component.
   */
  classNames?: {
    /**
     * Custom class names for the trigger (the button that opens the picker).
     */
    trigger?: string;
  };
  timePicker?: {
    hour?: boolean;
    minute?: boolean;
    second?: boolean;
  };
  /**
   * Custom render function for the trigger.
   */
  renderTrigger?: (props: DateTimeRenderTriggerProps) => React.ReactNode;
}

export interface DateTimeRenderTriggerProps {
  value: Date | undefined;
  open: boolean;
  timezone?: string;
  disabled?: boolean;
  use12HourFormat?: boolean;
  setOpen: (open: boolean) => void;
}

export function DateTimePicker({
  value,
  onChange,
  renderTrigger,
  min,
  max,
  timezone,
  hideTime,
  use12HourFormat,
  disabled,
  clearable,
  classNames,
  timePicker = {
    hour: true,
    minute: true,
    second: false,
  },
  ...props
}: DateTimePickerProps & CalendarProps) {
  const t = useTranslations();
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const [monthYearPicker, setMonthYearPicker] = useState<
    "month" | "year" | false
  >(false);
  const initDate = useMemo(
    () => new TZDate(value ?? new Date(), timezone),
    [value, timezone]
  );

  const [month, setMonth] = useState<Date>(initDate);
  const [date, setDate] = useState<Date>(initDate);

  const endMonth = useMemo(() => {
    return setYear(month, getYear(month) + 1);
  }, [month]);
  const minDate = useMemo(
    () => (min ? new TZDate(min, timezone) : undefined),
    [min, timezone]
  );
  const maxDate = useMemo(
    () => (max ? new TZDate(max, timezone) : undefined),
    [max, timezone]
  );

  const onDayChanged = useCallback(
    (d: Date) => {
      // d.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      // if (min && d < min) {
      //   d.setHours(min.getHours(), min.getMinutes(), min.getSeconds());
      // }
      // if (max && d > max) {
      //   d.setHours(max.getHours(), max.getMinutes(), max.getSeconds());
      // }
      const newDate = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );
      setDate(newDate);
    },
    [date, setDate]
  );
  const onSubmit = useCallback(() => {
    onChange(new Date(date));
    setOpen(false);
  }, [date, onChange]);

  const onMonthYearChanged = useCallback(
    (d: Date, mode: "month" | "year") => {
      setMonth(d);
      if (mode === "year") {
        setMonthYearPicker("month");
      } else {
        setMonthYearPicker(false);
      }
    },
    [setMonth, setMonthYearPicker]
  );
  const onNextMonth = useCallback(() => {
    setMonth(addMonths(month, 1));
  }, [month]);
  const onPrevMonth = useCallback(() => {
    setMonth(subMonths(month, 1));
  }, [month]);

  useEffect(() => {
    if (open) {
      setDate(initDate);
      setMonth(initDate);
      setMonthYearPicker(false);
    }
  }, [open, initDate]);

  const displayValue = useMemo(() => {
    if (!(open || value)) return value;
    return open ? date : initDate;
  }, [date, value, open]);

  const dislayFormat = useMemo(() => {
    if (!displayValue) return t("Pick a date");
    return format.dateTime(displayValue, "extensive");
  }, [displayValue, hideTime, use12HourFormat]);
  const locale = useLocale();

  const nextIntlLocaleToDayPickerLocale: Record<string, unknown> = {
    "en-US": enUS,
    "pt-BR": ptBR,
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        {renderTrigger ? (
          renderTrigger({
            disabled,
            open,
            setOpen,
            timezone,
            use12HourFormat,
            value: displayValue,
          })
        ) : (
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: <not my code not my problem>
          <div
            className={cn(
              "flex h-9 w-full cursor-pointer items-center rounded-md border border-input ps-3 pe-1 font-normal text-sm shadow-2xs",
              !displayValue && "text-muted-foreground",
              !(clearable && value) && "pe-3",
              disabled && "cursor-not-allowed opacity-50",
              classNames?.trigger
            )}
            onClick={(e) => {
              if (disabled) e.preventDefault();
            }}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: <biome migration>
            tabIndex={0}
          >
            <div className="flex grow items-center">
              <CalendarIcon className="mr-2 size-4" />
              {dislayFormat}
            </div>
            {clearable && value && (
              <Button
                aria-label="Clear date"
                className="ms-1 size-6 p-1"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange(undefined);
                  setOpen(false);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <XCircle className="size-4" />
              </Button>
            )}
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex items-center justify-between">
          <div className="ms-2 flex cursor-pointer items-center font-bold text-md">
            <div>
              {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <not my code not my problem> */}
              <span
                onClick={() =>
                  setMonthYearPicker(
                    monthYearPicker === "month" ? false : "month"
                  )
                }
              >
                {format.dateTime(month, {
                  month: "long",
                })}
              </span>
              {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <not my code not my problem> */}
              <span
                className="ms-1"
                onClick={() =>
                  setMonthYearPicker(
                    monthYearPicker === "year" ? false : "year"
                  )
                }
              >
                {format.dateTime(month, {
                  year: "numeric",
                })}
              </span>
            </div>
            <Button
              onClick={() =>
                setMonthYearPicker(monthYearPicker ? false : "year")
              }
              size="icon"
              variant="ghost"
            >
              {monthYearPicker ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>
          <div
            className={cn("flex space-x-2", monthYearPicker ? "hidden" : "")}
          >
            <Button onClick={onPrevMonth} size="icon" variant="ghost">
              <ChevronLeftIcon />
            </Button>
            <Button onClick={onNextMonth} size="icon" variant="ghost">
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <DayPicker
            classNames={{
              button_next: "hidden",
              button_previous: "hidden",
              day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
              day_button: cn(
                buttonVariants({ variant: "ghost" }),
                "size-9 rounded-md p-0 font-normal aria-selected:opacity-100"
              ),
              disabled: "text-muted-foreground opacity-50",
              dropdowns: "flex w-full gap-2",
              hidden: "invisible",
              month: "flex flex-col w-full",
              month_caption: "hidden",
              month_grid: "w-full border-collapse",
              months: "flex w-full h-fit",
              outside:
                "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              range_end: "day-range-end",
              range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md",
              today: "bg-accent text-accent-foreground",
              week: "flex w-full justify-between mt-2",
              weekday:
                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              weekdays: "flex justify-between mt-2",
            }}
            disabled={
              [
                max ? { after: max } : null,
                min ? { before: min } : null,
              ].filter(Boolean) as Matcher[]
            }
            endMonth={endMonth}
            locale={nextIntlLocaleToDayPickerLocale[locale] as never}
            mode="single"
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => d && onDayChanged(d)}
            selected={date}
            showOutsideDays={true}
            timeZone={timezone}
            {...props}
          />
          <div
            className={cn(
              "absolute top-0 right-0 bottom-0 left-0",
              monthYearPicker ? "bg-popover" : "hidden"
            )}
          />
          <MonthYearPicker
            className={cn(
              "absolute top-0 right-0 bottom-0 left-0",
              monthYearPicker ? "" : "hidden"
            )}
            maxDate={maxDate}
            minDate={minDate}
            mode={monthYearPicker as never}
            onChange={onMonthYearChanged}
            value={month}
          />
        </div>
        <div className="flex flex-col gap-2">
          {!hideTime && (
            <TimePicker
              max={maxDate}
              min={minDate}
              onChange={setDate}
              timePicker={timePicker}
              use12HourFormat={use12HourFormat}
              value={date}
            />
          )}
          <div className="flex flex-row-reverse items-center justify-between">
            <Button className="ms-2 h-7 px-2" onClick={onSubmit}>
              Done
            </Button>
            {timezone && (
              <div className="text-sm">
                <span>Timezone:</span>
                <span className="ms-1 font-semibold">{timezone}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MonthYearPicker({
  value,
  minDate,
  maxDate,
  mode = "month",
  onChange,
  className,
}: {
  value: Date;
  mode: "month" | "year";
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: Date, mode: "month" | "year") => void;
  className?: string;
}) {
  const format = useFormatter();
  const yearRef = useRef<HTMLDivElement>(null);
  const years = useMemo(() => {
    const _years: TimeOption[] = [];
    for (let i = 1912; i < 2100; i++) {
      let disabled = false;
      const startY = startOfYear(setYear(value, i));
      const endY = endOfYear(setYear(value, i));
      if (minDate && endY < minDate) disabled = true;
      if (maxDate && startY > maxDate) disabled = true;
      _years.push({ disabled, label: i.toString(), value: i });
    }
    return _years;
  }, [value]);
  const months = useMemo(() => {
    const _months: TimeOption[] = [];
    for (let i = 0; i < 12; i++) {
      let disabled = false;
      const startM = startOfMonth(setMonthFns(value, i));
      const endM = endOfMonth(setMonthFns(value, i));
      if (minDate && endM < minDate) disabled = true;
      if (maxDate && startM > maxDate) disabled = true;
      _months.push({
        disabled,
        label: format.dateTime(new Date(0, i), {
          month: "short",
        }),
        value: i,
      });
    }
    return _months;
  }, [value]);

  const onYearChange = useCallback(
    (v: TimeOption) => {
      let newDate = setYear(value, v.value);
      if (minDate && newDate < minDate) {
        newDate = setMonthFns(newDate, getMonth(minDate));
      }
      if (maxDate && newDate > maxDate) {
        newDate = setMonthFns(newDate, getMonth(maxDate));
      }
      onChange(newDate, "year");
    },
    [onChange, value, minDate, maxDate]
  );

  useEffect(() => {
    if (mode === "year") {
      yearRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [mode, value]);
  return (
    <div className={cn(className)}>
      <ScrollArea className="h-full">
        {mode === "year" && (
          <div className="grid grid-cols-4">
            {years.map((year) => (
              <div
                key={year.value}
                ref={year.value === getYear(value) ? yearRef : undefined}
              >
                <Button
                  className="rounded-full"
                  disabled={year.disabled}
                  onClick={() => onYearChange(year)}
                  variant={getYear(value) === year.value ? "default" : "ghost"}
                >
                  {year.label}
                </Button>
              </div>
            ))}
          </div>
        )}
        {mode === "month" && (
          <div className="grid grid-cols-3 gap-4">
            {months.map((month) => (
              <Button
                className="rounded-full"
                disabled={month.disabled}
                key={month.value}
                onClick={() =>
                  onChange(setMonthFns(value, month.value), "month")
                }
                size="lg"
                variant={getMonth(value) === month.value ? "default" : "ghost"}
              >
                {month.label}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface TimeOption {
  value: number;
  label: string;
  disabled: boolean;
}

function TimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  timePicker,
}: {
  use12HourFormat?: boolean;
  value: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  timePicker?: DateTimePickerProps["timePicker"];
}) {
  // hours24h = HH
  // hours12h = hh
  const formatStr = useMemo(
    () =>
      use12HourFormat
        ? "yyyy-MM-dd hh:mm:ss.SSS a xxxx"
        : "yyyy-MM-dd HH:mm:ss.SSS xxxx",
    [use12HourFormat]
  );
  const [ampm, setAmpm] = useState(
    datefnsFormat(value, "a") === "AM" ? AM_VALUE : PM_VALUE
  );
  const [hour, setHour] = useState(
    use12HourFormat ? +datefnsFormat(value, "hh") : value.getHours()
  );
  const [minute, setMinute] = useState(value.getMinutes());
  const [second, setSecond] = useState(value.getSeconds());

  useEffect(() => {
    onChange(
      buildTime({
        ampm,
        formatStr,
        hour,
        minute,
        second,
        use12HourFormat,
        value,
      })
    );
  }, [hour, minute, second, ampm, formatStr, use12HourFormat]);

  const _hourIn24h = useMemo(() => {
    // if (use12HourFormat) {
    //   return (hour % 12) + ampm * 12;
    // }
    return use12HourFormat ? (hour % 12) + ampm * 12 : hour;
  }, [value, use12HourFormat, ampm]);

  const hours: TimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (__, i) => {
        let disabled = false;
        const hourValue = use12HourFormat ? (i === 0 ? 12 : i) : i;
        const hDate = setHours(value, use12HourFormat ? i + ampm * 12 : i);
        const hStart = startOfHour(hDate);
        const hEnd = endOfHour(hDate);
        if (min && hEnd < min) disabled = true;
        if (max && hStart > max) disabled = true;
        return {
          disabled,
          label: hourValue.toString().padStart(2, "0"),
          value: hourValue,
        };
      }),
    [value, min, max, use12HourFormat, ampm]
  );
  const minutes: TimeOption[] = useMemo(() => {
    const anchorDate = setHours(value, _hourIn24h);
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false;
      const mDate = setMinutes(anchorDate, i);
      const mStart = startOfMinute(mDate);
      const mEnd = endOfMinute(mDate);
      if (min && mEnd < min) disabled = true;
      if (max && mStart > max) disabled = true;
      return {
        disabled,
        label: i.toString().padStart(2, "0"),
        value: i,
      };
    });
  }, [value, min, max, _hourIn24h]);
  const seconds: TimeOption[] = useMemo(() => {
    const anchorDate = setMilliseconds(
      setMinutes(setHours(value, _hourIn24h), minute),
      0
    );
    const _min = min ? setMilliseconds(min, 0) : undefined;
    const _max = max ? setMilliseconds(max, 0) : undefined;
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false;
      const sDate = setSeconds(anchorDate, i);
      if (_min && sDate < _min) disabled = true;
      if (_max && sDate > _max) disabled = true;
      return {
        disabled,
        label: i.toString().padStart(2, "0"),
        value: i,
      };
    });
  }, [value, minute, min, max, _hourIn24h]);
  const ampmOptions = useMemo(() => {
    const startD = startOfDay(value);
    const endD = endOfDay(value);
    return [
      { label: "AM", value: AM_VALUE },
      { label: "PM", value: PM_VALUE },
    ].map((v) => {
      let disabled = false;
      const start = addHours(startD, v.value * 12);
      const end = subHours(endD, (1 - v.value) * 12);
      if (min && end < min) disabled = true;
      if (max && start > max) disabled = true;
      return { ...v, disabled };
    });
  }, [value, min, max]);

  const [open, setOpen] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: "auto" });
        minuteRef.current?.scrollIntoView({ behavior: "auto" });
        secondRef.current?.scrollIntoView({ behavior: "auto" });
      }
    }, 1);
    return () => clearTimeout(timeoutId);
  }, [open]);

  const onHourChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        const newTime = buildTime({
          ampm,
          formatStr,
          hour: v.value,
          minute,
          second,
          use12HourFormat,
          value,
        });
        if (newTime < min) {
          setMinute(min.getMinutes());
          setSecond(min.getSeconds());
        }
      }
      if (max) {
        const newTime = buildTime({
          ampm,
          formatStr,
          hour: v.value,
          minute,
          second,
          use12HourFormat,
          value,
        });
        if (newTime > max) {
          setMinute(max.getMinutes());
          setSecond(max.getSeconds());
        }
      }
      setHour(v.value);
    },
    [setHour, use12HourFormat, value, formatStr, minute, second, ampm]
  );

  const onMinuteChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        const newTime = buildTime({
          ampm,
          formatStr,
          hour: v.value,
          minute,
          second,
          use12HourFormat,
          value,
        });
        if (newTime < min) {
          setSecond(min.getSeconds());
        }
      }
      if (max) {
        const newTime = buildTime({
          ampm,
          formatStr,
          hour: v.value,
          minute,
          second,
          use12HourFormat,
          value,
        });
        if (newTime > max) {
          setSecond(newTime.getSeconds());
        }
      }
      setMinute(v.value);
    },
    [setMinute, use12HourFormat, value, formatStr, hour, second, ampm]
  );

  const onAmpmChange = useCallback(
    (v: TimeOption) => {
      if (min) {
        const newTime = buildTime({
          ampm: v.value,
          formatStr,
          hour,
          minute,
          second,
          use12HourFormat,
          value,
        });
        if (newTime < min) {
          const minH = min.getHours() % 12;
          setHour(minH === 0 ? 12 : minH);
          setMinute(min.getMinutes());
          setSecond(min.getSeconds());
        }
      }
      if (max) {
        const newTime = buildTime({
          ampm: v.value,
          formatStr,
          hour,
          minute,
          second,
          use12HourFormat,
          value,
        });
        if (newTime > max) {
          const maxH = max.getHours() % 12;
          setHour(maxH === 0 ? 12 : maxH);
          setMinute(max.getMinutes());
          setSecond(max.getSeconds());
        }
      }
      setAmpm(v.value);
    },
    [setAmpm, use12HourFormat, value, formatStr, hour, minute, second, min, max]
  );
  const format = useFormatter();

  return (
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="justify-between"
          variant="outline"
        >
          <Clock className="mr-2 size-4" />
          {format.dateTime(value, "shortWithHours")}
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="top">
        <div className="flex-col gap-2 p-2">
          <div className="flex h-56 grow">
            {(!timePicker || timePicker.hour) && (
              <ScrollArea className="h-full grow" type="always">
                <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
                  {hours.map((v) => (
                    <div
                      key={v.value}
                      ref={v.value === hour ? hourRef : undefined}
                    >
                      <TimeItem
                        className="h-8"
                        disabled={v.disabled}
                        onSelect={onHourChange}
                        option={v}
                        selected={v.value === hour}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {(!timePicker || timePicker.minute) && (
              <ScrollArea className="h-full grow" type="always">
                <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
                  {minutes.map((v) => (
                    <div
                      key={v.value}
                      ref={v.value === minute ? minuteRef : undefined}
                    >
                      <TimeItem
                        className="h-8"
                        disabled={v.disabled}
                        onSelect={onMinuteChange}
                        option={v}
                        selected={v.value === minute}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {(!timePicker || timePicker.second) && (
              <ScrollArea className="h-full grow">
                <div className="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
                  {seconds.map((v) => (
                    <div
                      key={v.value}
                      ref={v.value === second ? secondRef : undefined}
                    >
                      <TimeItem
                        className="h-8"
                        disabled={v.disabled}
                        onSelect={(option) => setSecond(option.value)}
                        option={v}
                        selected={v.value === second}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {use12HourFormat && (
              <ScrollArea className="h-full grow">
                <div className="flex grow flex-col items-stretch overflow-y-auto pe-2">
                  {ampmOptions.map((v) => (
                    <TimeItem
                      className="h-8"
                      disabled={v.disabled}
                      key={v.value}
                      onSelect={onAmpmChange}
                      option={v}
                      selected={v.value === ampm}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const TimeItem = ({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: TimeOption;
  selected: boolean;
  onSelect: (option: TimeOption) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      className={cn("flex justify-center px-1 ps-1 pe-2", className)}
      disabled={disabled}
      onClick={() => onSelect(option)}
      variant="ghost"
    >
      <div className="w-4">
        {selected && <CheckIcon className="my-auto size-4" />}
      </div>
      <span className="ms-2">{option.label}</span>
    </Button>
  );
};

interface BuildTimeOptions {
  use12HourFormat?: boolean;
  value: Date;
  formatStr: string;
  hour: number;
  minute: number;
  second: number;
  ampm: number;
}

function buildTime(options: BuildTimeOptions) {
  const { use12HourFormat, value, formatStr, hour, minute, second, ampm } =
    options;
  let date: Date;
  if (use12HourFormat) {
    const dateStrRaw = datefnsFormat(value, formatStr);
    // yyyy-MM-dd hh:mm:ss.SSS a zzzz
    // 2024-10-14 01:20:07.524 AM GMT+00:00
    let dateStr =
      dateStrRaw.slice(0, 11) +
      hour.toString().padStart(2, "0") +
      dateStrRaw.slice(13);
    dateStr =
      dateStr.slice(0, 14) +
      minute.toString().padStart(2, "0") +
      dateStr.slice(16);
    dateStr =
      dateStr.slice(0, 17) +
      second.toString().padStart(2, "0") +
      dateStr.slice(19);
    dateStr =
      dateStr.slice(0, 24) +
      // biome-ignore lint/suspicious/noDoubleEquals: <biome migration>
      (ampm == AM_VALUE ? "AM" : "PM") +
      dateStr.slice(26);
    date = parse(dateStr, formatStr, value);
  } else {
    date = setHours(setMinutes(setSeconds(value, second), minute), hour);
  }
  return date;
}
