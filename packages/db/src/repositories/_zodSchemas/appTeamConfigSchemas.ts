import { z } from "zod";

import dayjs from "@kdx/dayjs";
import { kodixCareAppId } from "@kdx/shared";

// * ----- Exports live below this line ----- *//
// export const zAppTeamConfigUpdate = appTeamConfigSchema
//   .omit({ id: true })
//   .deepPartial();
// export const zAppTeamConfigCreate = appTeamConfigSchema;

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
const kodixCareConfigSchema = z.object({
  patientName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[^\d]+$/, {
      message: "Numbers are not allowed in the patient name",
    }),
  clonedCareTasksUntil: dateFromISO8601.optional(),
});
export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
};
export const appIdToAppTeamConfigSchemaUpdate = {
  [kodixCareAppId]: kodixCareConfigSchema.deepPartial(),
};

export type AppIdsWithUserAppTeamConfig =
  keyof typeof appIdToAppTeamConfigSchema; //? Some apps might not have userAppTeamConfig implemented
