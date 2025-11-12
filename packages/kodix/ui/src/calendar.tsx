"use client";

import { cn } from "@kodix/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ChevronProps, DayPicker } from "react-day-picker";

import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Chevron({ ...props }: ChevronProps) {
  return props.orientation === "left" ? (
    <ChevronLeft {...props} className="h-4 w-4" />
  ) : (
    <ChevronRight {...props} className="h-4 w-4" />
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "z-10 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "z-10 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        caption_label: "text-sm font-medium",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_button:
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        month_grid: "w-full border-collapse space-y-1",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 relative",
        nav: "flex items-center justify-between absolute inset-x-0",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        range_end: "day-range-end",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        week: "flex w-full mt-2",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        weekdays: "flex",
        weeks: "w-full border-collapse space-y-",
        ...classNames,
      }}
      components={{
        Chevron,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
