/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

//?Modified version of https://tie.openstatus.dev/
import type { ComponentProps, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import type { TimePickerType } from "./time-picker-utils";
import { cn } from "../.";
import { Input } from "../input";
import {
  getArrowByType,
  getDateByType,
  setDateByType,
} from "./time-picker-utils";

export interface TimePickerInputProps extends ComponentProps<"input"> {
  picker: TimePickerType;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = ({
  className,
  type = "number",
  value,
  id,
  name,
  date = new Date(new Date().setHours(0, 0, 0, 0)),
  setDate,
  onChange,
  onKeyDown,
  picker,
  onLeftFocus,
  onRightFocus,
  ...props
}: TimePickerInputProps) => {
  const [flag, setFlag] = useState<boolean>(false);

  /**
   * allow the user to enter the second digit within 2 seconds
   * otherwise start again with entering first digit
   */
  useEffect(() => {
    if (flag) {
      const timer = setTimeout(() => {
        setFlag(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flag]);

  const calculatedValue = useMemo(
    () => getDateByType(date, picker),
    [date, picker]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "ArrowRight") onRightFocus?.();
    if (e.key === "ArrowLeft") onLeftFocus?.();
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      const step = e.key === "ArrowUp" ? 1 : -1;
      const newValue = getArrowByType(calculatedValue, step, picker);
      if (flag) setFlag(false);
      const tempDate = new Date(date);
      setDate(setDateByType(tempDate, newValue, picker));
    }
    if (e.key >= "0" && e.key <= "9") {
      const newValue = flag ? calculatedValue.slice(1, 2) + e.key : "0" + e.key;
      if (flag) onRightFocus?.();
      setFlag((prev) => !prev);
      const tempDate = new Date(date);
      setDate(setDateByType(tempDate, newValue, picker));
    }
  };

  return (
    <Input
      className={cn(
        "w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      id={id || picker}
      inputMode="decimal"
      name={name || picker}
      onChange={(e) => {
        e.preventDefault();
        onChange?.(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        handleKeyDown(e);
      }}
      type={type}
      value={value || calculatedValue}
      {...props}
    />
  );
};

export { TimePickerInput };
