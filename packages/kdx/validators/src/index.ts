export { ZNanoId } from "@kodix/shared/utils";

/** Adjusts the given date to the nearest minute by setting the seconds and milliseconds to zero. */
export const adjustDateToMinute = (date: Date) => {
  date.setSeconds(0, 0);
  return date;
};
