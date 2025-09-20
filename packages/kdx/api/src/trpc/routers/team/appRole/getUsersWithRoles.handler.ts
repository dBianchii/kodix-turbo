import type { TGetUsersWithRolesInputSchema } from "@kdx/validators/trpc/team/appRole";
import { teamRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetUsersWithRolesOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetUsersWithRolesInputSchema;
}

export const getUsersWithRolesHandler = async ({
  ctx,
  input,
}: GetUsersWithRolesOptions) => {
  const users = await teamRepository.getUsersWithRoles({
    appId: input.appId,
    teamId: ctx.auth.user.activeTeamId,
  });

  return users;
};
