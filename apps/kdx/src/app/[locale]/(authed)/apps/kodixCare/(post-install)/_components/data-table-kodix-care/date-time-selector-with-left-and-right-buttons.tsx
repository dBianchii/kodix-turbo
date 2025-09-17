import { useEffect, useRef } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useCareTaskStore } from ".";

import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";
import { useIsAnyOverlayMounted } from "@kdx/ui/stores/use-overlay-store";

import { DatePicker } from "~/app/[locale]/_components/date-picker";

const useLeftAndRightKeyboardArrowClicks = () => {
  const shouldDisable = useIsAnyOverlayMounted();

  const leftArrowRef = useRef<HTMLButtonElement>(null);
  const rightArrowRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (shouldDisable) return;

      if (e.key === "ArrowLeft") leftArrowRef.current?.click();
      else if (e.key === "ArrowRight") rightArrowRef.current?.click();
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [shouldDisable]);

  return { leftArrowRef, rightArrowRef };
};

export function DateTimeSelectorWithLeftAndRightArrows() {
  const { leftArrowRef, rightArrowRef } = useLeftAndRightKeyboardArrowClicks();
  const { input, onDateChange } = useCareTaskStore();

  return (
    <div className="flex gap-2">
      <Button
        ref={leftArrowRef}
        variant="ghost"
        onClick={() => {
          leftArrowRef.current?.focus();
          onDateChange(dayjs(input.dateStart).subtract(1, "days").toDate());
        }}
        className="h-10 w-10 p-3"
      >
        <LuChevronLeft />
      </Button>
      <DatePicker
        date={input.dateEnd}
        setDate={(newDate) => onDateChange(dayjs(newDate).toDate())}
      />
      <Button
        ref={rightArrowRef}
        variant="ghost"
        onClick={() => {
          rightArrowRef.current?.focus();
          onDateChange(dayjs(input.dateStart).add(1, "days").toDate());
        }}
        className="h-10 w-10 p-3"
      >
        <LuChevronRight />
      </Button>
    </div>
  );
}
