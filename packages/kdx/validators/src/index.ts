import { NANOID_SIZE } from "@kodix/shared/utils";
import z from "zod";

export const NANOID_REGEX = new RegExp(`^[0-9a-z]{${NANOID_SIZE}}$`);
export const ZNanoId = z
  .string()
  .regex(NANOID_REGEX, { message: "Not a valid id" });

/** Adjusts the given date to the nearest minute by setting the seconds and milliseconds to zero. */
export const adjustDateToMinute = (date: Date) => {
  date.setSeconds(0, 0);
  return date;
};
