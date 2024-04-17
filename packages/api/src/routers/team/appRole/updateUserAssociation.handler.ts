import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq, inArray } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdateUserAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdateUserAssociationInputSchema;
}

export const updateUserAssociationHandler = async ({
  ctx,
  input,
}: UpdateUserAssociationOptions) => {
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(schema.teamAppRolesToUsers)
      .where(
        inArray(
          schema.teamAppRolesToUsers.teamAppRoleId,
          ctx.db
            .select({ id: schema.teamAppRoles.id })
            .from(schema.teamAppRoles)
            .where(
              eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
            ),
        ),
      );
    if (input.teamAppRoleIds.length > 0)
      await tx.insert(schema.teamAppRolesToUsers).values(
        input.teamAppRoleIds.map((appRoleId) => ({
          userId: input.userId,
          teamAppRoleId: appRoleId,
        })),
      );
  });
};
