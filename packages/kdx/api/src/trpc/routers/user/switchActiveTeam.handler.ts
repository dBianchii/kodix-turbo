import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";
import { db } from "@kdx/db/client";
import { userRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface SwitchActiveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TSwitchActiveTeamInputSchema;
}

export const switchActiveTeamHandler = async ({
  ctx,
  input,
}: SwitchActiveTeamOptions) => {
  await userRepository.moveUserToTeam(db, {
    userId: ctx.auth.user.id,
    newTeamId: input.teamId,
  });
};
