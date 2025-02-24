import { ForbiddenError } from "@casl/ability";
import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { careShifts } from "@kdx/db/schema";
import type { TEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { assertNoOverlappingShiftsForThisCaregiver } from "./_kodixCare.permissions";

interface EditCareShiftOptions {
  ctx: TProtectedProcedureContext;
  input: TEditCareShiftInputSchema;
}

export const editCareShiftHandler = async ({
  ctx,
  input,
}: EditCareShiftOptions) => {
  const { permissionsService, appActivityLogsService } = ctx.services;

  const { kodixCareRepository } = ctx.repositories;
  const oldShift = await kodixCareRepository.getCareShiftById(input.id);
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

  const permissions = await permissionsService.getUserPermissionsForApp({
    user: ctx.auth.user,
    appId: kodixCareAppId,
  });
  ForbiddenError.from(permissions).throwUnlessCan("Edit", {
    __typename: "CareShift",
    ...oldShift,
  });

  if (input.startAt && input.endAt) {
    const overlappingShifts = await kodixCareRepository.findOverlappingShifts({
      teamId: ctx.auth.user.activeTeamId,
      start: input.startAt,
      end: input.endAt,
    });

    assertNoOverlappingShiftsForThisCaregiver(ctx.t, {
      overlappingShifts: overlappingShifts.filter(
        (shift) => shift.id !== input.id,
      ),
      caregiverId: input.careGiverId ?? oldShift.caregiverId,
    });
  }

  const updateData: Partial<typeof careShifts.$inferInsert> = {
    startAt: input.startAt,
    endAt: input.endAt,
    caregiverId: input.careGiverId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    notes: input.notes,
    finishedByUserId: input.finishedByUserId,
  };

  await db.transaction(async (tx) => {
    await kodixCareRepository.updateCareShift(
      {
        id: input.id,
        input: updateData,
      },
      tx,
    );
    const newShift = await kodixCareRepository.getCareShiftById(input.id, tx);
    if (!newShift)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: ctx.t("api.Could not update resource"),
      });

    const changes = diff(oldShift, newShift);
    if (changes?.length)
      await appActivityLogsService.logActivity({
        appId: kodixCareAppId,
        userId: ctx.auth.user.id,
        teamId: ctx.auth.user.activeTeamId,
        type: "update",
        rowId: input.id,
        tableName: "careShift",
        diff: changes,
      });
  });
};
