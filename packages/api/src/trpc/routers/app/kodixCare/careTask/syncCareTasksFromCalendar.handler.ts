import { TRPCError } from "@trpc/server";

import { gte } from "@kdx/db";
import { careTasks } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getCurrentShiftHandler } from "../getCurrentShift.handler";
import { cloneCalendarTasksToCareTasks } from "../utils";

interface SyncCareTasksFromCalendarOptions {
  ctx: TProtectedProcedureContext;
}

export const syncCareTasksFromCalendarHandler = async ({
  ctx,
}: SyncCareTasksFromCalendarOptions) => {
  const currentShift = await getCurrentShiftHandler({ ctx });

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
