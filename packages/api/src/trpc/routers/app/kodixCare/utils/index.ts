import dayjs from "@kdx/dayjs";
import { careTasks } from "@kdx/db/schema";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getAllHandler } from "../../calendar/getAll.handler";
import { saveConfigHandler } from "../../saveConfig.handler";

const tomorrowEndOfDay = dayjs.utc().add(1, "day").endOf("day").toDate();
export async function cloneCalendarTasksToCareTasks({
  start,
  end = tomorrowEndOfDay,
  careShiftId, //? CurrentShift, where all tasks will be cloned to
  ctx,
}: {
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
    await ctx.db.insert(careTasks).values(
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

  await saveConfigHandler({
    ctx,
    input: {
      appId: kodixCareAppId,
      config: {
        clonedCareTasksUntil: end,
      },
    },
  });
}
