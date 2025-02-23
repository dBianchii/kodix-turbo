import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";
import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../procedures";

interface SwitchActiveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TSwitchActiveTeamInputSchema;
}

export const switchActiveTeamHandler = async ({
  ctx,
  input,
}: SwitchActiveTeamOptions) => {
  const { publicUserRepository } = ctx.publicRepositories;
  await publicUserRepository.moveUserToTeam(
    {
      userId: ctx.auth.user.id,
      newTeamId: input.teamId,
    },
    db,
  );
};
