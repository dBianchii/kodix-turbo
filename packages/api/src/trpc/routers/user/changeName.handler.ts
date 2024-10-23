import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";
import { eq } from "@kdx/db";
import { users } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  return await ctx.db
    .update(users)
    .set({ name: input.name })
    .where(eq(users.id, ctx.auth.user.id));
};
