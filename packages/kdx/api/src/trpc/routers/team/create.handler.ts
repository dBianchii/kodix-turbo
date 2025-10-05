import { nanoid } from "@kodix/shared/utils";

import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const teamId = nanoid();
  await db.transaction((tx) =>
    teamRepository.createTeamAndAssociateUser(tx, ctx.auth.user.id, {
      id: teamId,
      name: input.teamName,
      ownerId: ctx.auth.user.id,
    }),
  );

  return { id: teamId, name: input.teamName };
};
