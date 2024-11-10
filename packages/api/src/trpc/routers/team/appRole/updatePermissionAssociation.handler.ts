import { TRPCError } from "@trpc/server";

import type { TUpdatePermissionAssociationInputSchema } from "@kdx/validators/trpc/team/appRole";
import { db } from "@kdx/db/client";
import { appRepository } from "@kdx/db/repositories";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface UpdatePermissionAssociationOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TUpdatePermissionAssociationInputSchema;
}

export const updatePermissionAssociationHandler = async ({
  input,
}: UpdatePermissionAssociationOptions) => {
  const permission = await appRepository.findAppPermissionById(
    input.permissionId,
  );
  if (!permission) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Permission not found",
    });
  }

  if (!permission.editable) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Permission is not editable",
    });
  }

  await db.transaction(async (tx) => {
    await appRepository.removePermissionFromRole(tx, {
      //! Security issue found.
      permissionId: input.permissionId,
      appId: input.appId,
    });
    if (input.teamAppRoleIds.length > 0)
      await appRepository.createManyAppPermissionToRoleAssociations(
        tx,
        input.teamAppRoleIds.map((id) => ({
          teamAppRoleId: id,
          appPermissionId: input.permissionId,
        })),
      );
  });
};
