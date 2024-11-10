import { TRPCError } from "@trpc/server";

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
  await db.transaction(async (tx) => {
    if (input.userId === ctx.auth.user.id) {
      //need to detect if they are sending the admin role to prevent removing themselves
      const adminTeamAppRolesForApp =
        await teamRepository.findAdminTeamAppRolesForApp(tx, {
          appId: input.appId,
        });

      if (
        !adminTeamAppRolesForApp.some((x) =>
          input.teamAppRoleIds.includes(x.id),
        )
      )
        throw new TRPCError({
          message: ctx.t(
            "api.You cannot remove yourself from the Administrator role",
          ),
          code: "BAD_REQUEST",
        });
    }

    // await teamRepository
    await teamRepository.removeUserAssociationsFromTeamAppRolesByTeamIdAndAppId(
      tx,
      {
        appId: input.appId,
        teamId: ctx.auth.user.activeTeamId,
        userId: input.userId,
      },
    );

    if (input.teamAppRoleIds.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await teamRepository.associateManyAppRolesToUsers(
        tx,
        input.teamAppRoleIds.map((appRoleId) => ({
          userId: input.userId,
          teamAppRoleId: appRoleId,
        })),
      );
  });
};
