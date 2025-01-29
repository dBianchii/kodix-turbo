import { TRPCError } from "@trpc/server";

import type { TDeleteCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeleteCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteCareShiftInputSchema;
}

export const deleteCareShiftHandler = async ({
  ctx,
  input,
}: DeleteCareShiftOptions) => {
  const careShift = await kodixCareRepository.getCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
  if (!careShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Shift not found"),
    });
  }

  // if (careShift.createdById !== ctx.auth.user.id) {
  //   const myRoles = await getMyRolesHandler({
  //     ctx,
  //     input: { appId: kodixCareAppId },
  //   });
  //   const isAdmin = myRoles.some(
  //     (role) => role.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
  //   );
  //   if (!isAdmin) {
  //     throw new TRPCError({
  //       code: "UNAUTHORIZED",
  //       message: ctx.t(
  //         "api.This shift was not originally created by you ask your team manager to delete it",
  //       ),
  //     });
  //   }
  // }

  await kodixCareRepository.deleteCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
};
