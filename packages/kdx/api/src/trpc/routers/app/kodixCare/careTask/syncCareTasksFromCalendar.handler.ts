import { db } from "@kdx/db/client";
import { careTaskRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { cloneCalendarTasksToCareTasks } from "../utils";

interface SyncCareTasksFromCalendarOptions {
  ctx: TProtectedProcedureContext;
}

export const syncCareTasksFromCalendarHandler = async ({
  ctx,
}: SyncCareTasksFromCalendarOptions) => {
  const syncFromDate = new Date(); //TODO: determine this date

  await db.transaction(async (tx) => {
    await careTaskRepository.deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
      {
        date: syncFromDate,
        teamId: ctx.auth.user.activeTeamId,
      },
      tx,
    );

    await cloneCalendarTasksToCareTasks({
      ctx: {
        ...ctx,
      },
      start: syncFromDate,
      tx,
    });
  });
};
