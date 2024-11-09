import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { nanoid } from "@kdx/db/nanoid";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const teamId = nanoid();
  await ctx.db.transaction(
    async (tx) =>
      await teamRepository.createTeamAndAssociateUser(tx, ctx.auth.user.id, {
        id: teamId,
        ownerId: ctx.auth.user.id,
        name: input.teamName,
      }),
  );

  return { name: input.teamName, id: teamId };
};
