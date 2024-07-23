import type { TDeleteNotificationsInputSchema } from "@kdx/validators/trpc/user";
import { and, eq, inArray } from "@kdx/db";
import * as schema from "@kdx/db/schema";

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
    .delete(schema.notifications)
    .where(
      and(
        eq(schema.notifications.sentToUserId, ctx.session.user.id),
        inArray(schema.notifications.id, input.ids),
      ),
    );
};
