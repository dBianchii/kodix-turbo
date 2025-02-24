import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";

import type { TDeleteCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeleteCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteCareShiftInputSchema;
}

export const deleteCareShiftHandler = async ({
  ctx,
  input,
}: DeleteCareShiftOptions) => {
  const { permissionsService } = ctx.services;
  const { kodixCareRepository } = ctx.repositories;
  const careShift = await kodixCareRepository.getCareShiftById(input.id);
  if (!careShift) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Shift not found"),
    });
  }

  const ability = await permissionsService.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("Delete", {
    __typename: "CareShift",
    ...careShift,
  });

  await kodixCareRepository.deleteCareShiftById(input.id);
};
