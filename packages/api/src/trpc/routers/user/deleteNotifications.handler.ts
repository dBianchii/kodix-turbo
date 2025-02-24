import type { TDeleteNotificationsInputSchema } from "@kdx/validators/trpc/user";

import type { TProtectedProcedureContext } from "../../procedures";

interface DeleteNotificationsOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteNotificationsInputSchema;
}

export const deleteNotificationsHandler = async ({
  ctx,
  input,
}: DeleteNotificationsOptions) => {
  const { publicNotificationsRepository } = ctx.publicRepositories;
  await publicNotificationsRepository.deleteUserNotifications({
    userId: ctx.auth.user.id,
    ids: input.ids,
  });
};
