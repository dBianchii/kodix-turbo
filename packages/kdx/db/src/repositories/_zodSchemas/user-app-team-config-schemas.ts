import { kodixCareAppId } from "@kodix/shared/db";
import z from "zod";

const kodixCareUserAppTeamConfigSchema = z.object({
  sendNotificationsForDelayedTasks: z.boolean().optional(),
});
export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
};
export const appIdToUserAppTeamConfigSchemaUpdate = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema.partial(),
};
