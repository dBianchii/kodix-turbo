import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface SyncCareTasksFromCalendarOptions {
  ctx: TProtectedProcedureContext;
}

export const syncCareTasksFromCalendarHandler = async ({
  ctx,
}: SyncCareTasksFromCalendarOptions) => {
  const { careTaskRepository } = ctx.repositories;
  const { calendarAndCareTaskService } = ctx.services;

  const syncFromDate = new Date(); //TODO: determine this date

  await db.transaction(async (tx) => {
    await careTaskRepository.deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
      {
        date: syncFromDate,
      },
      tx,
    );
    await calendarAndCareTaskService.cloneCalendarTasksToCareTasks({
      start: syncFromDate,
      teamId: ctx.auth.user.activeTeamId,
      tx,
    });
  });
};
