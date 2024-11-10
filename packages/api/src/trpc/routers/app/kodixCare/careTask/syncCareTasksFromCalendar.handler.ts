import { TRPCError } from "@trpc/server";

import { db } from "@kdx/db/client";
import { careTaskRepository, kodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { cloneCalendarTasksToCareTasks } from "../utils";

interface SyncCareTasksFromCalendarOptions {
  ctx: TProtectedProcedureContext;
}

export const syncCareTasksFromCalendarHandler = async ({
  ctx,
}: SyncCareTasksFromCalendarOptions) => {
  const currentShift = await kodixCareRepository.getCurrentCareShiftByTeamId(
    ctx.auth.user.activeTeamId,
  );

  if (!currentShift || currentShift.shiftEndedAt) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.The current shift must be ongoing for this action"),
    });
  }

  if (currentShift.Caregiver.id !== ctx.auth.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You are not the caregiver of the current shift so you cannot sync tasks",
      ),
    });

  const syncFromDate = currentShift.checkIn;
  await db.transaction(async (tx) => {
    await careTaskRepository.deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
      tx,
      {
        teamId: ctx.auth.user.activeTeamId,
        date: syncFromDate,
      },
    );

    await cloneCalendarTasksToCareTasks({
      tx,
      start: syncFromDate,
      careShiftId: currentShift.id,
      ctx: {
        ...ctx,
      },
    });
  });
};
