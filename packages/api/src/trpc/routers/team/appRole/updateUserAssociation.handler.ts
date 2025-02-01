import { ForbiddenError } from "@casl/ability";

import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { getUserPermissionsForTeam } from "@kdx/auth/get-user-permissions";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdateUserAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdateUserAssociationInputSchema;
}
export const updateUserAssociationHandler = async ({
  ctx,
  input,
}: UpdateUserAssociationOptions) => {
  const ability = await getUserPermissionsForTeam({
    teamId: ctx.auth.user.activeTeamId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("update", {
    __typename: "UserTeamAppRole",
    role: "ADMIN",
  });

  await db.transaction(async (tx) => {
    await teamRepository.removeUserAssociationsFromTeamAppRolesByTeamIdAndAppId(
      tx,
      {
        appId: input.appId,
        teamId: ctx.auth.user.activeTeamId,
        userId: input.userId,
      },
    );

    if (input.roles.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await teamRepository.associateManyAppRolesToUsers(
        input.roles.map((role) => ({
          userId: input.userId,
          role,
          teamId: ctx.auth.user.activeTeamId,
          appId: input.appId,
        })),
        tx,
      );
  });
};
