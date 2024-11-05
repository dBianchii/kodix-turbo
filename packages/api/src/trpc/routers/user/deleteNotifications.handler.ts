import type { TDeleteNotificationsInputSchema } from "@kdx/validators/trpc/user";
import { notificationRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface DeleteNotificationsOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteNotificationsInputSchema;
}

export const deleteNotificationsHandler = async ({
  ctx,
  input,
}: DeleteNotificationsOptions) => {
  await notificationRepository.deleteUserNotificationsWithinTeams({
    userId: ctx.auth.user.id,
    teamIds: input.ids,
  });
};
