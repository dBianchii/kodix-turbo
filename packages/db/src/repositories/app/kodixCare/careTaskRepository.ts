import type { SQLWrapper } from "drizzle-orm";
import type { z } from "zod";
import { and, eq, gte, inArray, isNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareTaskCreate,
  zCareTaskCreateMany,
  zCareTaskUpdate,
} from "../../_zodSchemas/careTaskSchemas";
import { db as _db } from "../../../client";
import { careTasks } from "../../../schema";

interface CareTask {
  id: typeof careTasks.$inferSelect.id;
  title: typeof careTasks.$inferSelect.title;
  description: typeof careTasks.$inferSelect.description;
  date: typeof careTasks.$inferSelect.date;
  doneAt: typeof careTasks.$inferSelect.doneAt;
  updatedAt: typeof careTasks.$inferSelect.updatedAt;
  doneByUserId: typeof careTasks.$inferSelect.doneByUserId;
  details: typeof careTasks.$inferSelect.details;
  type: typeof careTasks.$inferSelect.type;
  teamId: typeof careTasks.$inferSelect.teamId;
  eventMasterId: string | null;
}

export function CareTaskRepository(teamIds: string[]) {
  function withinTeams(...sqls: (SQLWrapper | undefined)[]) {
    const teamExpression =
      teamIds.length === 1
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          eq(careTasks.teamId, teamIds[0]!)
        : inArray(careTasks.teamId, teamIds);
    if (!sqls.length) return teamExpression;
    return and(teamExpression, ...sqls);
  }

  async function findCareTasksFromTo(
    {
      dateStart,
      dateEnd,
      onlyCritical = false,
      onlyNotDone = false,
    }: {
      dateStart: Date;
      dateEnd: Date;
      onlyCritical?: boolean;
      onlyNotDone?: boolean;
    },
    db = _db,
  ) {
    const careTasks: CareTask[] = await db.query.careTasks.findMany({
      where: (careTask, { gte, lte }) =>
        withinTeams(
          onlyCritical ? eq(careTask.type, "CRITICAL") : undefined,
          onlyNotDone ? isNull(careTask.doneAt) : undefined,
          gte(careTask.date, dateStart),
          lte(careTask.date, dateEnd),
        ),
      columns: {
        doneAt: true,
        id: true,
        title: true,
        description: true,
        date: true,
        updatedAt: true,
        doneByUserId: true,
        details: true,
        type: true,
        teamId: true,
        eventMasterId: true,
      },
    });

    return careTasks;
  }
  async function findCareTaskById(id: string, db = _db) {
    return db.query.careTasks.findFirst({
      where: (careTask, { eq }) => withinTeams(eq(careTask.id, id)),
    });
  }

  async function deleteCareTaskById(id: string, db = _db) {
    await db.delete(careTasks).where(withinTeams(eq(careTasks.id, id)));
  }

  async function deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
    {
      teamId,
      date,
    }: {
      teamId: string;
      date: Date;
    },
    db = _db,
  ) {
    await db
      .delete(careTasks)
      .where(
        withinTeams(
          eq(careTasks.teamId, teamId),
          eq(careTasks.createdFromCalendar, true),
          gte(careTasks.date, date),
        ),
      );
  }

  async function deleteAllCareTasksForTeam(db = _db) {
    await db.delete(careTasks).where(withinTeams());
  }

  async function updateCareTask(
    { id, input }: Update<typeof zCareTaskUpdate>,
    db = _db,
  ) {
    await db
      .update(careTasks)
      .set(input)
      .where(withinTeams(eq(careTasks.id, id)));
  }

  async function createCareTask(
    careTask: z.infer<typeof zCareTaskCreate>,
    db = _db,
  ) {
    //TODO: Should we check if the teamId is in the teamIds before inserting?
    return db.insert(careTasks).values(careTask).$returningId();
  }

  async function createManyCareTasks(
    data: z.infer<typeof zCareTaskCreateMany>,
    db = _db,
  ) {
    //TODO: Should we check if the teamId is in the teamIds before inserting?
    await db.insert(careTasks).values(data);
  }

  return {
    findCareTasksFromTo,
    findCareTaskById,
    deleteCareTaskById,
    deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan,
    deleteAllCareTasksForTeam,
    updateCareTask,
    createCareTask,
    createManyCareTasks,
  };
}
