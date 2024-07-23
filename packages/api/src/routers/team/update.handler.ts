import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";
import { eq } from "@kdx/db";
import * as schema from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateHandler {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: CreateHandler) => {
  const team = await ctx.db
    .update(schema.teams)
    .set({
      name: input.teamName,
    })
    .where(eq(schema.teams.id, input.teamId));
  return team;
};
