import { z } from "zod";

import { kodixCareAppId } from "@kdx/shared";

import { dateFromISO8601 } from ".";

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░▒█▒▓█▓░▒▓░░░░░░░░░░░▒▒░░░░░░░░░░░░░░░░░░░▓▒░▓▓▒▓█░░▓█▓▒██░░██░░░█▒░░░░▒░░░░░░░░░░░░░░░░░░
// ░░░▓█▒░░░▒██▒▒█▓▓█▒▒██▓█▓▒██▓█▓░██▓██░░░░░░░█▓▒█▓▒░░░▓▓░░░░▒█░█▒█▒░█▓░░░░▓▒▓█▓█▓░░░░▓█▓█▓░░░
// ░░░▒░░░▒█▒▒▓░▓▓░░▒▓▓█░░▓▓▒█░░▓█▒█░░░█░░░░░░░█▓░░░░░█▓▓█░░░░▓█░█░░███▓░░░░▓▒▓▒░▒▓░░░░▒████░░░
// ░░░▓█▓▓▓▓░▒█▒▒█▓▓█▒▒▓░░▓▒▒█░░▓█░██▓██░░░░█▓▓█▒▒█▓▓▓█▒░▒█▓▓██░░█░░░▒█▒░░░░▓▒▓▒░▒▓░░░░█▓▒██░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█▒▒▓▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░▒█▒▒▓▓░░▓▓▒▒█▓░░█░░░░░░░░█▓▒▓█▓░░░░░░░▒▒░░░░░░░█▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░▒██▒▒░░▓▒░░░░▓▓▒█░░░░░░░░█░░░░█▓▒▓▒▓▓▒██▒▓▓▒▓█░██▒▒█▒░█▒▒█▒▒█▒▓▓▒▓▓▒▓▒░░░░░░░░░░░
// ░░░░░░░░░░░▒▒░░░▓▓▓▓░░░░▓▓▒█░░░░░░░░█░░░░█▓▒████░▓▒░▒████░█▒░░▓█░████▒░▓██▓▓████▓░░░░░░░░░░░
// ░░░░░░░░░░░▒█████░░▓█████░░█████░░░░█████▒░▓████▒▒█▒▓████▓█████░▒█████▓███▓▒▓███▒░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒░░░░░░▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒░░░░░░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒░░░░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒░▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░▓▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▓█▒▒▒▓▓▓██▓▒▒░░░░░░░░░▓█▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒█▒▒█████████████▓▓▓▓▓▓▓▓▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒███████████████▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒██████████████▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓█████████████████░░░░░░░░▒▒▒▒▓▓▓▒▒▒▒░░░░░░░░░░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▓▓▓▓▓▓███████▒░░░░░░▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▒▒▒▓▓▓▓▒▒▒▒
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▓██████░░░░░░░░░░░░▒░░░░░░░░░▒▒▒░░░░▒▒▒▒
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▓▒▒▒▒▓▓▓▓▓▒▓▓▒░░░░▒▒▒▒▒▒▓█████▓░░░░░░░░░▒▒▒▒▒▒▒▒▒░▒█████▓░░░░░░
// ▒▒░░░░░░░░░░░░░░░░░░░░░░░▒▒▓██▒░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒███████▒▒▒▒░░░░░░░░░░░░░░░▓██████▒░░░░░
// ▒▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░▒▒░░░░░░░░░░░▒▒▒▒▒▒▒▒░░▒▒▒▒▓▓▒███▒▒▒▒▒▒▒▒░░░░░░░░░░░▒▓████▓░░░░░░
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▒▒▒░░░░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓████████████▒▓▒▒▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▒▒▓▓▓▓▒░░░▒▒▒▒▒▒▒▓█████████████████▓▓▓███▓▓██████▓▒▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▓
// ▒▓▒▒▒▒▒▒▓▓▓▓███████████▓▓▓█▓▓▓▓▒▒▒▓▓▓████████████████████▓█▓████▓▓▓▓░▒▓██▓▒▒▓▓▓▓▓▓▓▓██▓███▓▓
// ▓▓▓▓▓▓▓████████████████▒▒░▒▒▒▓▓▒▒▒▓█▓███████████████████████▓▓▓▓▓▓▓▓▓▓███▒▒▒▒▓▓█▓▒▒▓▓█▓▒░░░░
// ▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▓▒▒▓▓▒▒▒██▓▓████▓▓▓▓▓█████▓█▓▓▓▓▓▒▒▒▒▒▒▒▒▓██▒▒▒▒▒▒▒▓████████▓▓▓▓▓▓
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓████▓▓▓▓▓▓▓██▓▓█▓▓▓▓▓▓▓▓▓████▓▓▓▓▓█████▓▓▓▓▓███▓▓▓▓▓▓▓▓█████████▓▓▓▓▓
// ████████████████████████████████████████████████████████████████████████████████████████████

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

export const kodixCareUserAppTeamConfigSchema = z.object({
  sendNotificationsForDelayedTasks: z.boolean().optional(),
});

export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
};

export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
};
