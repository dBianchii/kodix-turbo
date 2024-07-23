import type { TUpdateUserAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { eq } from "@kdx/db";
import * as schema from "@kdx/db/schema";

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
      .where(eq(schema.teamAppRolesToUsers.userId, input.userId));

    if (input.teamAppRoleIds.length)
      // If there are any teamAppRoleIds to connect, insert them after deletion
      await tx.insert(schema.teamAppRolesToUsers).values(
        input.teamAppRoleIds.map((appRoleId) => ({
          userId: input.userId,
          teamAppRoleId: appRoleId,
        })),
      );
  });
};
