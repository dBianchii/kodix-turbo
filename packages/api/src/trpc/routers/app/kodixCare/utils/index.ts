import type { Drizzle } from "@kdx/db/client";
import dayjs from "@kdx/dayjs";
import { appRepository, careTaskRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getAllHandler } from "../../calendar/getAll.handler";

const tomorrowEndOfDay = dayjs.utc().add(1, "day").endOf("day").toDate();
export async function cloneCalendarTasksToCareTasks({
  tx,
  start,
  end = tomorrowEndOfDay,
  careShiftId, //? CurrentShift, where all tasks will be cloned to
  ctx,
}: {
  tx: Drizzle;
  start: Date;
  end?: Date;
  careShiftId: string;
  ctx: TProtectedProcedureContext;
}) {
  const calendarTasks = await getAllHandler({
    ctx,
    input: {
      dateStart: start,
      dateEnd: end,
    },
  });

  if (calendarTasks.length > 0)
    await careTaskRepository.createManyCareTasks(
      tx,
      calendarTasks.map((calendarTask) => ({
        careShiftId: careShiftId,
        teamId: ctx.auth.user.activeTeamId,
        title: calendarTask.title,
        description: calendarTask.description,
        date: calendarTask.date,
        eventMasterId: calendarTask.eventMasterId,
        doneByUserId: null,
        type: calendarTask.type,
        createdBy: calendarTask.createdBy,
        createdFromCalendar: true,
      })),
    );

  await appRepository.upsertAppTeamConfig({
    teamId: ctx.auth.user.activeTeamId,
    appId: kodixCareAppId,
    config: {
      clonedCareTasksUntil: end,
    },
  });
}
