import type { TDeleteNotificationsInputSchema } from "@kdx/validators/trpc/user";
import { and, eq, inArray } from "@kdx/db";
import { notifications } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface DeleteNotificationsOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteNotificationsInputSchema;
}

export const deleteNotificationsHandler = async ({
  ctx,
  input,
}: DeleteNotificationsOptions) => {
  await ctx.db
    .delete(notifications)
    .where(
      and(
        eq(notifications.sentToUserId, ctx.session.user.id),
        inArray(notifications.id, input.ids),
      ),
    );
};
