import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface SwitchActiveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TSwitchActiveTeamInputSchema;
}

export const switchActiveTeamHandler = async ({
  ctx,
  input,
}: SwitchActiveTeamOptions) => {
  await ctx.db.update(schema.users).set({ activeTeamId: input.teamId }).where(
    eq(schema.users.id, ctx.session.user.id),
    //TODO: Make sure they are part of the team!!
  );
};
