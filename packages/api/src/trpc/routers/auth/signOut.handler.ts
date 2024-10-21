import type { TSignOutInputSchema } from "@kdx/validators/trpc/auth";
import { invalidateSession } from "@kdx/auth";
import { eq } from "@kdx/db";
import { expoTokens } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface SignOutOptions {
  ctx: TProtectedProcedureContext;
  input: TSignOutInputSchema;
}

export const signOutHandler = async ({ ctx, input }: SignOutOptions) => {
  if (!ctx.token) return { success: false };

  if (input?.expoToken)
    await ctx.db
      .delete(expoTokens)
      .where(eq(expoTokens.token, input.expoToken));

  await invalidateSession(ctx.auth.session.id);

  return { success: true };
};
