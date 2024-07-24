import { careTasks } from "@kdx/db/schema";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getAllHandler } from "../../calendar/getAll.handler";
import { saveConfigHandler } from "../../saveConfig.handler";

export async function cloneCalendarTasksToCareTasks({
  start,
  end,
  careShiftId,
  ctx,
}: {
  start: Date;
  end: Date;
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
        teamId: ctx.session.user.activeTeamId,
        title: calendarTask.title,
        description: calendarTask.description,
        eventDate: calendarTask.date,
        eventMasterId: calendarTask.eventMasterId,
        doneByUserId: null,
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
