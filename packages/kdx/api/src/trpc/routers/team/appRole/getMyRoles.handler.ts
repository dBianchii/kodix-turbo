import type { TGetMyRolesInputSchema } from "@kdx/validators/trpc/team/appRole";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetMyRolesOptions {
  ctx: TProtectedProcedureContext;
  input: TGetMyRolesInputSchema;
}

export const getMyRolesHandler = async ({ ctx, input }: GetMyRolesOptions) => {
  const roles = await teamRepository.findUserRolesByTeamIdAndAppId({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
  });

  return roles;
};
