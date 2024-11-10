import type { TGetAllInputSchema } from "@kdx/validators/trpc/team/appRole";
import { teamRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({ ctx, input }: GetAllOptions) => {
  return await teamRepository.findManyTeamAppRolesByTeamAndApp({
    teamId: ctx.auth.user.activeTeamId,
    appId: input.appId,
  });
};
