import { lucia } from "@kdx/auth";

import type { TProtectedProcedureContext } from "../../procedures";

interface SignOutOptions {
  ctx: TProtectedProcedureContext;
}

export const signOutHandler = async ({ ctx }: SignOutOptions) => {
  if (!ctx.token) {
    return { success: false };
  }
  await lucia.invalidateSession(ctx.session.session.id);
  return { success: true };
};
