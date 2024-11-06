import { TRPCError } from "@trpc/server";

import { and, eq, gte } from "@kdx/db";
import { kodixCareRepository } from "@kdx/db/repositories";
import { careTasks } from "@kdx/db/schema";

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
  await ctx.db.transaction(async (tx) => {
    await tx
      .delete(careTasks)
      .where(
        and(
          eq(careTasks.createdFromCalendar, true),
          gte(careTasks.date, syncFromDate),
        ),
      );

    await cloneCalendarTasksToCareTasks({
      start: syncFromDate,
      careShiftId: currentShift.id,
      ctx: {
        ...ctx,
        db: tx,
      },
    });
  });
};
