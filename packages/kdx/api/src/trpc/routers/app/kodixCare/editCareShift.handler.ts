import { ForbiddenError } from "@casl/ability";
import { kodixCareAppId } from "@kodix/shared/db";
import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { careShifts } from "@kdx/db/schema";
import type { TEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { logActivity } from "../../../../services/appActivityLogs.service";
import { assertNoOverlappingShiftsForThisCaregiver } from "./_kodixCare.permissions";

interface EditCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TEditCareShiftInputSchema;
}

export const editCareShiftHandler = async ({
  ctx,
  input,
}: EditCareShiftOptions) => {
  const { services } = ctx;
  const oldShift = await kodixCareRepository.getCareShiftById({
    id: input.id,
    teamId: ctx.auth.user.activeTeamId,
  });
  if (!oldShift)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.Shift not found"),
    });

  if (oldShift.finishedByUserId)
    if (input.finishedByUserId !== null)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ctx.t("api.Cannot edit finished shifts"),
      });

  const permissions = await services.permissions.getUserPermissionsForApp({
    appId: kodixCareAppId,
    user: ctx.auth.user,
  });
  ForbiddenError.from(permissions).throwUnlessCan("Edit", {
    __typename: "CareShift",
    ...oldShift,
  });

  if (input.startAt && input.endAt) {
    const overlappingShifts = await kodixCareRepository.findOverlappingShifts({
      end: input.endAt,
      start: input.startAt,
      teamId: ctx.auth.user.activeTeamId,
    });

    assertNoOverlappingShiftsForThisCaregiver(ctx.t, {
      caregiverId: input.careGiverId ?? oldShift.caregiverId,
      overlappingShifts: overlappingShifts.filter(
        (shift) => shift.id !== input.id,
      ),
    });
  }

  const updateData: Partial<typeof careShifts.$inferInsert> = {
    caregiverId: input.careGiverId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    endAt: input.endAt,
    finishedByUserId: input.finishedByUserId,
    notes: input.notes,
    startAt: input.startAt,
  };

  await db.transaction(async (tx) => {
    await kodixCareRepository.updateCareShift(
      {
        id: input.id,
        input: updateData,
      },
      tx,
    );
    const newShift = await kodixCareRepository.getCareShiftById(
      {
        id: input.id,
        teamId: ctx.auth.user.activeTeamId,
      },
      tx,
    );
    if (!newShift)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: ctx.t("api.Could not update resource"),
      });

    const changes = diff(oldShift, newShift);
    if (changes?.length)
      await logActivity({
        appId: kodixCareAppId,
        diff: changes,
        rowId: input.id,
        tableName: "careShift",
        teamId: ctx.auth.user.activeTeamId,
        type: "update",
        userId: ctx.auth.user.id,
      });
  });
};
