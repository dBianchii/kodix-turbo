import { TRPCError } from "@trpc/server";

import { gte } from "@kdx/db";
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

  if (!currentShift || currentShift.checkOut) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.The current shift must be ongoing for this action"),
    });
  }

  const syncFromDate = currentShift.checkIn;
  await ctx.db.transaction(async (tx) => {
    await tx.delete(careTasks).where(gte(careTasks.date, syncFromDate));

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
