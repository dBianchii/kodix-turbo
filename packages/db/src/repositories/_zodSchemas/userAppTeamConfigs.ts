import z from "zod";

import { kodixCareAppId } from "@kdx/shared/db";

const kodixCareUserAppTeamConfigSchema = z.object({
  sendNotificationsForDelayedTasks: z.boolean().optional(),
});
export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
};
export const appIdToUserAppTeamConfigSchemaUpdate = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema.partial(),
};
