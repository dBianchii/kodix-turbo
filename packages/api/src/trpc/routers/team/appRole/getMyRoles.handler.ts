import type { TGetMyRolesInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetMyRolesOptions {
  ctx: TProtectedProcedureContext;
  input: TGetMyRolesInputSchema;
}

export const getMyRolesHandler = async ({ ctx, input }: GetMyRolesOptions) => {
  const { teamRepository } = ctx.repositories;

  const roles = await teamRepository.findUserRolesByTeamIdAndAppId({
    appId: input.appId,
    userId: ctx.auth.user.id,
  });

  return roles;
};
