import { ForbiddenError } from "@casl/ability";
import { kodixCareAppId } from "@kodix/shared/db";
import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { TCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { logActivity } from "../../../../services/appActivityLogs.service";
import { assertNoOverlappingShiftsForThisCaregiver } from "./_kodixCare.permissions";

interface CreateCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareShiftInputSchema;
}

export const createCareShiftHandler = async ({
  ctx,
  input,
}: CreateCareShiftOptions) => {
  const { services } = ctx;

  const ability = await services.permissions.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(ability).throwUnlessCan("Create", {
    __typename: "CareShift",
    caregiverId: input.careGiverId,
    createdById: ctx.auth.user.id,
  });

  const overlappingShifts = await kodixCareRepository.findOverlappingShifts({
    end: input.endAt,
    start: input.startAt,
    teamId: ctx.auth.user.activeTeamId,
  });
  assertNoOverlappingShiftsForThisCaregiver(ctx.t, {
    caregiverId: input.careGiverId,
    overlappingShifts: overlappingShifts,
  });

  await db.transaction(async (tx) => {
    const shift = {
      caregiverId: input.careGiverId,
      createdById: ctx.auth.user.id,
      endAt: input.endAt,
      startAt: input.startAt,
      teamId: ctx.auth.user.activeTeamId,
    };
    const [result] = await kodixCareRepository.createCareShift(shift, tx);
    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: ctx.t("api.Could not create shift"),
      });
    }

    await logActivity({
      appId: kodixCareAppId,
      diff: diff({}, shift),
      rowId: result.id,
      tableName: "careShift",
      teamId: ctx.auth.user.activeTeamId,
      type: "create",
      userId: ctx.auth.user.id,
    });
  });
};
