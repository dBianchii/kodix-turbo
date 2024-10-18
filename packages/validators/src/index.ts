import { z } from "zod";

import dayjs from "@kdx/dayjs";
import { NANOID_SIZE } from "@kdx/shared";

/**
 * Converts a value to a Date object using the ISO 8601 format.
 * If the value is already a Date object, it is returned as is.
 * If the value is a string, it is parsed using the dayjs library and converted to a Date object.
 * @returns A Date object representing the input value.
 */
export const dateFromISO8601 = z.preprocess(
  (value) => (value instanceof Date ? value : dayjs(value as string).toDate()),
  z.date(),
);

export const NANOID_REGEX = new RegExp(`^[0-9a-z]{${NANOID_SIZE}}$`);
export const ZNanoId = z
  .string()
  .regex(NANOID_REGEX, { message: "Not a valid id" });
