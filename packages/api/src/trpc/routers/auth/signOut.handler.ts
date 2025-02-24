import type { TSignOutInputSchema } from "@kdx/validators/trpc/auth";
import { invalidateSession } from "@kdx/auth";

import type { TProtectedProcedureContext } from "../../procedures";

interface SignOutOptions {
  ctx: TProtectedProcedureContext;
  input: TSignOutInputSchema;
}

export const signOutHandler = async ({ ctx, input }: SignOutOptions) => {
  const { publicNotificationsRepository } = ctx.publicRepositories;

  if (!ctx.token) return { success: false };

  if (input?.expoToken) {
    await publicNotificationsRepository.deleteManyExpoTokensByUserId({
      tokens: [input.expoToken],
      userId: ctx.auth.user.id,
    });
  }

  await invalidateSession(ctx.auth.session.id);

  return { success: true };
};
