import z from "zod";

export const NANOID_REGEX = /^[0-9a-z]{12}$/;
export const ZNanoId = z
  .string()
  .regex(NANOID_REGEX, { message: "Not a valid id" }); //If this is changed, the NANOID_SIZE in @kodix/shared must be updated

/** Adjusts the given date to the nearest minute by setting the seconds and milliseconds to zero. */
export const adjustDateToMinute = (date: Date) => {
  date.setSeconds(0, 0);
  return date;
};
