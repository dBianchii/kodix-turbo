import { useEffect, useRef } from "react";
import dayjs from "@kodix/dayjs";
import { Button } from "@kodix/ui/button";
import { DatePicker } from "@kodix/ui/common/date-picker";
import { useIsAnyOverlayMounted } from "@kodix/ui/stores/use-overlay-store";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import { useCareTaskStore } from "../data-table-kodix-care";

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
        className="h-10 w-10 p-3"
        onClick={() => {
          leftArrowRef.current?.focus();
          onDateChange(dayjs(input.dateStart).subtract(1, "days").toDate());
        }}
        ref={leftArrowRef}
        variant="ghost"
      >
        <LuChevronLeft />
      </Button>
      <DatePicker
        date={input.dateEnd}
        setDate={(newDate) => onDateChange(dayjs(newDate).toDate())}
      />
      <Button
        className="h-10 w-10 p-3"
        onClick={() => {
          rightArrowRef.current?.focus();
          onDateChange(dayjs(input.dateStart).add(1, "days").toDate());
        }}
        ref={rightArrowRef}
        variant="ghost"
      >
        <LuChevronRight />
      </Button>
    </div>
  );
}
