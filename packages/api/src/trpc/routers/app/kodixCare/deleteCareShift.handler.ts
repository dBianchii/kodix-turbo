import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";

import type { TDeleteCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { kodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared/db";

import type { TProtectedProcedureContext } from "../../../procedures";

interface DeleteCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TDeleteCareShiftInputSchema;
}

export const deleteCareShiftHandler = async ({
  ctx,
  input,
}: DeleteCareShiftOptions) => {
  const { services } = ctx;
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

  const ability = await services.permissions.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("Delete", {
    __typename: "CareShift",
    ...careShift,
  });

  await kodixCareRepository.deleteCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
};
