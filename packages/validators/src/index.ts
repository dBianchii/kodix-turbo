import { z } from "zod";

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
  clonedCareTasksUntil: z.date().optional(),
});
