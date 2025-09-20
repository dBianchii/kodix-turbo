import type { TSignOutInputSchema } from "@kdx/validators/trpc/auth";
import { invalidateSession } from "@kdx/auth";
import { notificationRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface SignOutOptions {
  ctx: TProtectedProcedureContext;
  input: TSignOutInputSchema;
}

export const signOutHandler = async ({ ctx, input }: SignOutOptions) => {
  if (!ctx.token) return { success: false };

  if (input?.expoToken)
    await notificationRepository.deleteManyExpoTokens([input.expoToken]);

  await invalidateSession(ctx.auth.session.id);

  return { success: true };
};
