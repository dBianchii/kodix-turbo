import { TRPCError } from "@trpc/server";

import type { TCreateCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId, kodixCareRoleDefaultIds } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { logActivity } from "../../../../services/appActivityLogs.service";
import { getMyRolesHandler } from "../../team/appRole/getMyRoles.handler";
import { assertNoOverlappingShiftsForThisCaregiver } from "./_kodixCare.permissions";

interface CreateCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareShiftInputSchema;
}

export const createCareShiftHandler = async ({
  ctx,
  input,
}: CreateCareShiftOptions) => {
  if (input.careGiverId !== ctx.auth.user.id) {
    const roles = await getMyRolesHandler({
      ctx,
      input: { appId: kodixCareAppId },
    });

    if (
      !roles.some(
        (role) => role.appRoleDefaultId === kodixCareRoleDefaultIds.admin,
      )
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ctx.t(
          "api.Only admins can create shifts for other caregivers",
        ),
      });
    }
  }

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
      body: shift,
    });
  });
};
