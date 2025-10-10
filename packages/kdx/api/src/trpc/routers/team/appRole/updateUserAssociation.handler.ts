import { ForbiddenError } from "@casl/ability";
import { typedObjectEntries } from "@kodix/shared/utils";

import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
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
  const { services } = ctx;

  const toRemoveRoles = typedObjectEntries(input.roles).filter(
    ([_, value]) => !value,
  );
  const permission = await services.permissions.getUserPermissionsForTeam({
    teamId: ctx.auth.user.activeTeamId,
    user: ctx.auth.user,
  });
  for (const [role] of toRemoveRoles)
    ForbiddenError.from(permission).throwUnlessCan("Delete", {
      __typename: "UserTeamAppRole",
      role,
      userId: input.userId,
    });

  const toAddRoles = typedObjectEntries(input.roles).filter(
    ([_, value]) => value,
  );

  if (!(toAddRoles.length || toRemoveRoles.length)) return;

  await db.transaction(async (tx) => {
    if (toRemoveRoles.length)
      await teamRepository.removeUserAssociationsFromTeamAppRolesByTeamIdAndAppIdAndRoles(
        {
          appId: input.appId,
          roles: toRemoveRoles.map(([role]) => role),
          teamId: ctx.auth.user.activeTeamId,
          userId: input.userId,
        },
        tx,
      );

    if (toAddRoles.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await teamRepository.associateManyAppRolesToUsers(
        toAddRoles.map(([role]) => ({
          appId: input.appId,
          role,
          teamId: ctx.auth.user.activeTeamId,
          userId: input.userId,
        })),
        tx,
      );
  });
};
