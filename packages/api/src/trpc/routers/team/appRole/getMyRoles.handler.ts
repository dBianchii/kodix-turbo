import type { TGetMyRolesInputSchema } from "@kdx/validators/trpc/team/appRole";
import { teamRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetMyRolesOptions {
  ctx: TProtectedProcedureContext;
  input: TGetMyRolesInputSchema;
}

export const getMyRolesHandler = async ({ ctx, input }: GetMyRolesOptions) => {
  const roles = await teamRepository.findManyTeamAppRolesByTeamAndAppAndUser({
    appId: input.appId,
    userId: ctx.auth.user.id,
    teamId: ctx.auth.user.activeTeamId,
  });

  return roles;
};
