import { z } from "zod";

/**
 * @description Schema for validating team updates
 * @usedBy kdx/api kdx/kdx
 */
export const updateTeamSchema = z.object({
  teamId: z.string().cuid(),
  teamName: z
    .string()
    .min(3, { message: "Team name must be at least 3 characters" })
    .max(32, {
      message: "Team name must be at most 32 characters",
    }),
});

/**
 * @description Schema for validating user invitation
 * @usedBy kdx/api kdx/kdx
 */
export const inviteUserSchema = z.object({
  teamId: z.string().cuid(),
  to: z
    .string()
    .email()
    .min(1, { message: "At least one email is required in the 'to' field" })
    .or(
      z.string().email().array().min(1, {
        message: "At least one email is required in the 'to' field",
      }),
    )
    .transform((value) => {
      if (Array.isArray(value)) return value;
      else return [value];
    }),
});

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
});
