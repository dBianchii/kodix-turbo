import { ForbiddenError } from "@casl/ability";

import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { getUserPermissionsForTeam } from "@kdx/auth/get-user-permissions";
import { db } from "@kdx/db/client";
import { teamRepository } from "@kdx/db/repositories";
import { typedObjectEntries } from "@kdx/shared";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdateUserAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdateUserAssociationInputSchema;
}

export const updateUserAssociationHandler = async ({
  ctx,
  input,
}: UpdateUserAssociationOptions) => {
  const toRemoveRoles = typedObjectEntries(input.roles).filter(
    ([_, value]) => !value,
  );
  const ability = await getUserPermissionsForTeam({
    teamId: ctx.auth.user.activeTeamId,
    user: ctx.auth.user,
  });
  for (const [role] of toRemoveRoles)
    ForbiddenError.from(ability).throwUnlessCan("delete", {
      __typename: "UserTeamAppRole",
      role,
      userId: input.userId,
    });

  const toAddRoles = typedObjectEntries(input.roles).filter(
    ([_, value]) => value,
  );

  await db.transaction(async (tx) => {
    if (toRemoveRoles.length) {
      await teamRepository.removeUserAssociationsFromTeamAppRolesByTeamIdAndAppIdAndRoles(
        {
          appId: input.appId,
          teamId: ctx.auth.user.activeTeamId,
          userId: input.userId,
          roles: toRemoveRoles.map(([role]) => role),
        },
        tx,
      );
    }
    if (toAddRoles.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await teamRepository.associateManyAppRolesToUsers(
        toAddRoles.map(([role]) => ({
          userId: input.userId,
          role,
          teamId: ctx.auth.user.activeTeamId,
          appId: input.appId,
        })),
      );
  });
};
