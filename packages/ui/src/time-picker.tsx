"use client";

import * as React from "react";
import { ClockIcon } from "@radix-ui/react-icons";

import type { TimePickerType } from "./time-picker-input/time-picker-utils";
import { Label } from "./label";
import { TimePickerInput } from "./time-picker-input";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  granularity?: TimePickerType;
  disabledDate?: (date: Date) => boolean;
}

export function TimePicker({
  date,
  setDate,
  granularity = "minutes",
  disabledDate,
}: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);

  const setDateBasedOnDisabledDate = (newDate: Date | undefined) => {
    if (newDate && disabledDate?.(newDate)) return;
    setDate(newDate);
  };

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDateBasedOnDisabledDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      {(granularity === "seconds" || granularity === "minutes") && (
        <>
          <div className="grid gap-1 text-center">
            <Label htmlFor="minutes" className="text-xs">
              Minutes
            </Label>
            <TimePickerInput
              picker="minutes"
              date={date}
              setDate={setDateBasedOnDisabledDate}
              ref={minuteRef}
              onLeftFocus={() => hourRef.current?.focus()}
              onRightFocus={() => secondRef.current?.focus()}
            />
          </div>
          {granularity === "seconds" && (
            <div className="grid gap-1 text-center">
              <Label htmlFor="seconds" className="text-xs">
                Seconds
              </Label>
              <TimePickerInput
                picker="seconds"
                date={date}
                setDate={setDateBasedOnDisabledDate}
                ref={secondRef}
                onLeftFocus={() => minuteRef.current?.focus()}
              />
            </div>
          )}
        </>
      )}
      <div className="flex h-10 items-center">
        <ClockIcon className="ml-2 h-4 w-4" />
      </div>
    </div>
  );
}
