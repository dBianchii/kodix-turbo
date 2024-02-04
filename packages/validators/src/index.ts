import { z } from "zod";

import dayjs from "@kdx/dayjs";
import { kodixCareAppId } from "@kdx/shared";

const dateFromISO8601 = z.preprocess(
  (value) => (value instanceof Date ? value : dayjs(value as string).toDate()),
  z.date(),
);

/**
 * @description Schema for validating kodix care config
 * @usedBy kdx/api kdx/kdx
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
