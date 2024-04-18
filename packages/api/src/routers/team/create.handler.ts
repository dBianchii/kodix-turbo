import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const teamId = nanoid();
  await ctx.db.transaction(async (tx) => {
    const team = await tx.insert(schema.teams).values({
      id: teamId,
      ownerId: ctx.session.user.id,
      name: input.teamName,
    });
    await tx
      .insert(schema.usersToTeams)
      .values({ userId: ctx.session.user.id, teamId });
    return team;
  });

  return { name: input.teamName, id: teamId };
};
