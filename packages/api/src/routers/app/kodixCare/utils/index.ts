import type { Drizzle } from "@kdx/db/client";
import { and, eq } from "@kdx/db";
import { db as _db } from "@kdx/db/client";
import * as schema from "@kdx/db/schema";
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
    await ctx.db.insert(schema.careTasks).values(
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
      id: schema.teams.id,
    })
    .from(schema.teams)
    .where(
      and(
        eq(schema.usersToTeams.userId, userId),
        eq(schema.appsToTeams.appId, appId),
      ),
    )
    .innerJoin(
      schema.appsToTeams,
      eq(schema.appsToTeams.teamId, schema.teams.id),
    )
    .innerJoin(
      schema.usersToTeams,
      eq(schema.usersToTeams.teamId, schema.teams.id),
    );
}
