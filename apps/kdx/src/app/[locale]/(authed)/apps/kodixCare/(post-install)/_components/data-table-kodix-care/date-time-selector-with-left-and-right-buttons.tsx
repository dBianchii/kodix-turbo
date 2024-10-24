import { useEffect, useRef } from "react";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";

import dayjs from "@kdx/dayjs";
import { Button } from "@kdx/ui/button";

import { DatePicker } from "~/app/[locale]/_components/date-picker";
import { useCareTaskStore } from ".";

const useLeftAndRightArrowsSelect = () => {
  const shouldDisable = useCareTaskStore(
    (state) =>
      state.editDetailsOpen || state.unlockMoreTasksCredenzaWithDateOpen,
  );
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
  const { leftArrowRef, rightArrowRef } = useLeftAndRightArrowsSelect();
  const { input, onDateChange } = useCareTaskStore();

  return (
    <div className="flex gap-2">
      <Button
        ref={leftArrowRef}
        variant="ghost"
        onClick={() => {
          onDateChange(dayjs(input.dateStart).subtract(1, "days").toDate());
        }}
        className="h-10 w-10 p-3"
      >
        <RxChevronLeft />
      </Button>
      <DatePicker
        date={input.dateEnd}
        setDate={(newDate) => onDateChange(dayjs(newDate).toDate())}
      />
      <Button
        ref={rightArrowRef}
        variant="ghost"
        onClick={() => {
          onDateChange(dayjs(input.dateStart).add(1, "days").toDate());
        }}
        className="h-10 w-10 p-3"
      >
        <RxChevronRight />
      </Button>
    </div>
  );
}
