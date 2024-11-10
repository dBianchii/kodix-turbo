import type { TGetPermissionsInputSchema } from "@kdx/validators/trpc/team/appRole";
import { teamRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetPermissionsOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetPermissionsInputSchema;
}

export const getPermissionsHandler = async ({
  ctx,
  input,
}: GetPermissionsOptions) => {
  return await teamRepository.findAppPermissionsForTeam({
    teamId: ctx.auth.user.activeTeamId,
    appId: input.appId,
  });
};
