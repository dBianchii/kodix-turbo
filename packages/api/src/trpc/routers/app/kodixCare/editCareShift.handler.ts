import { TRPCError } from "@trpc/server";
import { diff } from "deep-diff";

import type { careShifts } from "@kdx/db/schema";
import type { TEditCareShiftInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { db } from "@kdx/db/client";
import { kodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

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

  // const currentUserIsShiftsCaregiver =
  //   ctx.auth.user.id === oldShift.caregiverId;

  // if (!currentUserIsShiftsCaregiver) {
  //   const myRoles = await getMyRolesHandler({
  //     ctx,
  //     input: { appId: kodixCareAppId },
  //   });

  //   if (
  //     !myRoles.some((x) => x.appRoleDefaultId === kodixCareRoleDefaultIds.admin)
  //   )
  //     throw new TRPCError({
  //       code: "FORBIDDEN",
  //       message: ctx.t("api.Only admins can edit shifts for other caregivers"),
  //     });
  // }

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
        userId: ctx.auth.user.id,
        teamId: ctx.auth.user.activeTeamId,
        type: "update",
        rowId: input.id,
        tableName: "careShift",
        diff: changes,
      });
  });
};
