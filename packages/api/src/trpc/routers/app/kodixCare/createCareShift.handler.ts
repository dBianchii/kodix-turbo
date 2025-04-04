import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { TCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

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
    start: input.startAt,
    end: input.endAt,
    teamId: ctx.auth.user.activeTeamId,
  });
  assertNoOverlappingShiftsForThisCaregiver(ctx.t, {
    caregiverId: input.careGiverId,
    overlappingShifts: overlappingShifts,
  });

  await db.transaction(async (tx) => {
    const shift = {
      createdById: ctx.auth.user.id,
      caregiverId: input.careGiverId,
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
      teamId: ctx.auth.user.activeTeamId,
      userId: ctx.auth.user.id,
      tableName: "careShift",
      rowId: result.id,
      type: "create",
      diff: diff({}, shift),
    });
  });
};
