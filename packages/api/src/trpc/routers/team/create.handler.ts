import type { TCreateInputSchema } from "@kdx/validators/trpc/team";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";

import type { TProtectedProcedureContext } from "../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const { publicTeamRepository } = ctx.publicRepositories;
  const teamId = nanoid();
  await db.transaction((tx) =>
    publicTeamRepository.createTeamAndAssociateUser(
      ctx.auth.user.id,
      {
        id: teamId,
        ownerId: ctx.auth.user.id,
        name: input.teamName,
      },
      tx,
    ),
  );

  return { name: input.teamName, id: teamId };
};
