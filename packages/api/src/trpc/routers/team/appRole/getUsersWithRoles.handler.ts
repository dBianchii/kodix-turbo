import type { TGetUsersWithRolesInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetUsersWithRolesOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetUsersWithRolesInputSchema;
}

export const getUsersWithRolesHandler = async ({
  ctx,
  input,
}: GetUsersWithRolesOptions) => {
  const { teamRepository } = ctx.repositories;
  const users = await teamRepository.getUsersWithRoles({
    appId: input.appId,
  });

  return users;
};
