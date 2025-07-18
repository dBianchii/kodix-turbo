import { z } from "zod";

export const NANOID_REGEX = /^[0-9a-z]{12}$/;
export const ZNanoId = z
  .string()
  .regex(NANOID_REGEX, { message: "Not a valid id" }); //If this is changed, the NANOID_SIZE in @kdx/shared must be updated

// Validator for model IDs (30 characters max) - allows alphanumeric, hyphens, underscores, and dots
export const MODEL_ID_REGEX = /^[0-9a-zA-Z\-_.]{1,30}$/;
export const ZModelId = z
  .string()
  .regex(MODEL_ID_REGEX, { message: "Not a valid model id" })
  .max(30, { message: "Model ID must be 30 characters or less" });

/** Adjusts the given date to the nearest minute by setting the seconds and milliseconds to zero. */
export const adjustDateToMinute = (date: Date) => {
  date.setSeconds(0, 0);
  return date;
};
