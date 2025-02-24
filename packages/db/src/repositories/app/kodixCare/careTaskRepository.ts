import type { z } from "zod";
import { eq, gte, isNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareTaskCreate,
  zCareTaskCreateMany,
  zCareTaskUpdate,
} from "../../_zodSchemas/careTaskSchemas";
import { db as _db } from "../../../client";
import { careTasks } from "../../../schema";
import { assertTeamIdInList, createWithinTeamsForTable } from "../../utils";

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

export function careTaskRepositoryFactory(teamIds: string[]) {
  const withinTeamsCareTask = createWithinTeamsForTable(teamIds, careTasks);

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
        withinTeamsCareTask(
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
      where: (careTask, { eq }) => withinTeamsCareTask(eq(careTask.id, id)),
    });
  }

  async function deleteCareTaskById(id: string, db = _db) {
    await db.delete(careTasks).where(withinTeamsCareTask(eq(careTasks.id, id)));
  }

  async function deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
    {
      date,
    }: {
      date: Date;
    },
    db = _db,
  ) {
    await db
      .delete(careTasks)
      .where(
        withinTeamsCareTask(
          eq(careTasks.createdFromCalendar, true),
          gte(careTasks.date, date),
        ),
      );
  }

  async function deleteAllCareTasksForTeam(db = _db) {
    await db.delete(careTasks).where(withinTeamsCareTask());
  }

  async function updateCareTask(
    { id, input }: Update<typeof zCareTaskUpdate>,
    db = _db,
  ) {
    await db
      .update(careTasks)
      .set(input)
      .where(withinTeamsCareTask(eq(careTasks.id, id)));
  }

  async function createCareTask(
    careTask: z.infer<typeof zCareTaskCreate>,
    db = _db,
  ) {
    assertTeamIdInList(careTask, teamIds);
    return db.insert(careTasks).values(careTask).$returningId();
  }

  async function createManyCareTasks(
    data: z.infer<typeof zCareTaskCreateMany>,
    db = _db,
  ) {
    for (const task of data) assertTeamIdInList(task, teamIds);

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
