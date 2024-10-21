import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { nanoid } from "@kdx/db/nanoid";
import { teams, usersToTeams } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const teamId = nanoid();
  await ctx.db.transaction(async (tx) => {
    const team = await tx.insert(teams).values({
      id: teamId,
      ownerId: ctx.auth.user.id,
      name: input.teamName,
    });
    await tx.insert(usersToTeams).values({ userId: ctx.auth.user.id, teamId });
    return team;
  });

  return { name: input.teamName, id: teamId };
};
