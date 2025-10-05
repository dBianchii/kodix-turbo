import dayjs from "@kodix/dayjs";
import { kodixCareAppId } from "@kodix/shared/db";

import type { Drizzle } from "@kdx/db/client";
import { appRepository, careTaskRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getAllHandler } from "../../calendar/getAll.handler";

const tomorrowEndOfDay = dayjs.utc().add(1, "day").endOf("day").toDate();
export async function cloneCalendarTasksToCareTasks({
  tx,
  start,
  end = tomorrowEndOfDay,
  ctx,
}: {
  tx: Drizzle;
  start: Date;
  end?: Date;
  ctx: TProtectedProcedureContext;
}) {
  const calendarTasks = await getAllHandler({
    ctx,
    input: {
      dateEnd: end,
      dateStart: start,
    },
  });

  if (calendarTasks.length > 0)
    await careTaskRepository.createManyCareTasks(
      calendarTasks.map((calendarTask) => ({
        createdBy: calendarTask.createdBy,
        createdFromCalendar: true,
        date: calendarTask.date,
        description: calendarTask.description,
        doneByUserId: null,
        eventMasterId: calendarTask.eventMasterId,
        teamId: ctx.auth.user.activeTeamId,
        title: calendarTask.title,
        type: calendarTask.type,
      })),
      tx,
    );

  await appRepository.upsertAppTeamConfig({
    appId: kodixCareAppId,
    config: {
      clonedCareTasksUntil: end,
    },
    teamId: ctx.auth.user.activeTeamId,
  });
}
