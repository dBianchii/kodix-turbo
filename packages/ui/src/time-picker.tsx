"use client";

import { useRef } from "react";
import { Clock } from "lucide-react";

import type { TimePickerType } from "./time-picker-input/time-picker-utils";
import { Label } from "./label";
import { TimePickerInput } from "./time-picker-input";

type TimePickerDemoProps = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  granularity?: TimePickerType;
  disabledDate?: (date: Date) => boolean;
};

export function TimePicker({
  date,
  setDate,
  granularity = "minutes",
  disabledDate,
}: TimePickerDemoProps) {
  const minuteRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  const setDateBasedOnDisabledDate = (newDate: Date | undefined) => {
    if (newDate && disabledDate?.(newDate)) return;
    setDate(newDate);
  };

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label className="text-xs" htmlFor="hours">
          Hours
        </Label>
        <TimePickerInput
          date={date}
          onRightFocus={() => minuteRef.current?.focus()}
          picker="hours"
          ref={hourRef}
          setDate={setDateBasedOnDisabledDate}
        />
      </div>
      {(granularity === "seconds" || granularity === "minutes") && (
        <>
          <div className="grid gap-1 text-center">
            <Label className="text-xs" htmlFor="minutes">
              Minutes
            </Label>
            <TimePickerInput
              date={date}
              onLeftFocus={() => hourRef.current?.focus()}
              onRightFocus={() => secondRef.current?.focus()}
              picker="minutes"
              ref={minuteRef}
              setDate={setDateBasedOnDisabledDate}
            />
          </div>
          {granularity === "seconds" && (
            <div className="grid gap-1 text-center">
              <Label className="text-xs" htmlFor="seconds">
                Seconds
              </Label>
              <TimePickerInput
                date={date}
                onLeftFocus={() => minuteRef.current?.focus()}
                picker="seconds"
                ref={secondRef}
                setDate={setDateBasedOnDisabledDate}
              />
            </div>
          )}
        </>
      )}
      <div className="flex h-10 items-center">
        <Clock className="ml-2 h-4 w-4" />
      </div>
    </div>
  );
}
