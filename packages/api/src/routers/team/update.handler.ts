import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";
import { eq } from "@kdx/db";
import { teams } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateHandler {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: CreateHandler) => {
  const team = await ctx.db
    .update(teams)
    .set({
      name: input.teamName,
    })
    .where(eq(teams.id, input.teamId));
  return team;
};
