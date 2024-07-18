import { z } from "zod";

import dayjs from "@kdx/dayjs";
import { NANOID_SIZE } from "@kdx/db/nanoid";
import { kodixCareAppId } from "@kdx/shared";

/**
 * Converts a value to a Date object using the ISO 8601 format.
 * If the value is already a Date object, it is returned as is.
 * If the value is a string, it is parsed using the dayjs library and converted to a Date object.
 * @returns A Date object representing the input value.
 */
const dateFromISO8601 = z.preprocess(
  (value) => (value instanceof Date ? value : dayjs(value as string).toDate()),
  z.date(),
);

/**
 * @description Schema for validating kodix care config
 */
export const kodixCareConfigSchema = z.object({
  patientName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[^\d]+$/, {
      message: "Numbers are not allowed in the patient name",
    }),
  clonedCareTasksUntil: dateFromISO8601.optional(),
});

//TODO: Maybe move this getAppTeamConfigSchema elsewhere
export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
};

//If this is changed, the NANOID_SIZE in @kdx/shared must be updated.
export const NANOID_REGEX = /^[0-9a-z]{12}$/;
export const ZNanoId = z
  .string()
  .regex(NANOID_REGEX, { message: "Not a valid id" });

//If this is changed please update generateUserId in @kdx/auth
export const ZUserId = z
  .string()
  .length(NANOID_SIZE)
  .regex(/^[a-z2-7]+$/); //? lowercase letters between a and z, and numbers between 2 and 7.
