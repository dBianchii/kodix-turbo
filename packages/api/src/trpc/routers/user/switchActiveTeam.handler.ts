import type { TSwitchActiveTeamInputSchema } from "@kdx/validators/trpc/user";

import type { TProtectedProcedureContext } from "../../procedures";
import { switchActiveTeamForUser } from "./utils";

interface SwitchActiveTeamOptions {
  ctx: TProtectedProcedureContext;
  input: TSwitchActiveTeamInputSchema;
}

export const switchActiveTeamHandler = async ({
  ctx,
  input,
}: SwitchActiveTeamOptions) => {
  await switchActiveTeamForUser({
    db: ctx.db,
    userId: ctx.session.user.id,
    teamId: input.teamId,
  });
};
