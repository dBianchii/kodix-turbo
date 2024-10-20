import type { Drizzle } from "@kdx/db/client";
import dayjs from "@kdx/dayjs";
import { and, eq } from "@kdx/db";
import { db as _db } from "@kdx/db/client";
import { appsToTeams, careTasks, teams, usersToTeams } from "@kdx/db/schema";
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
        teamId: ctx.session.user.activeTeamId,
        title: calendarTask.title,
        description: calendarTask.description,
        date: calendarTask.date,
        eventMasterId: calendarTask.eventMasterId,
        doneByUserId: null,
        type: calendarTask.type,
        createdBy: calendarTask.createdBy,
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

export async function getUserTeamsWithAppInstalled({
  userId,
  appId,
  db = _db,
}: {
  userId: string;
  appId: string;
  db: Drizzle;
}) {
  return await db
    .select({
      id: teams.id,
    })
    .from(teams)
    .where(and(eq(usersToTeams.userId, userId), eq(appsToTeams.appId, appId)))
    .innerJoin(appsToTeams, eq(appsToTeams.teamId, teams.id))
    .innerJoin(usersToTeams, eq(usersToTeams.teamId, teams.id));
}
