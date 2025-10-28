import type { z } from "zod";
import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";

import type { Drizzle } from "../../../client";
import type { Update } from "../../_types";
import type {
  zCareTaskCreate,
  zCareTaskCreateMany,
  zCareTaskUpdate,
} from "../../_zodSchemas/care-task-schemas";
import { db as _db } from "../../../client";
import { careTasks } from "../../../schema";

export interface CareTask {
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

export function findCareTasksFromTo(
  {
    dateStart,
    dateEnd,
    teamIds,
    onlyCritical = false,
    onlyNotDone = false,
  }: {
    dateStart: Date;
    dateEnd: Date;
    teamIds: string[];
    onlyCritical?: boolean;
    onlyNotDone?: boolean;
  },
  db = _db,
) {
  return db.query.careTasks.findMany({
    columns: {
      date: true,
      description: true,
      details: true,
      doneAt: true,
      doneByUserId: true,
      eventMasterId: true,
      id: true,
      teamId: true,
      title: true,
      type: true,
      updatedAt: true,
    },
    where: and(
      inArray(careTasks.teamId, teamIds),
      onlyCritical ? eq(careTasks.type, "CRITICAL") : undefined,
      onlyNotDone ? isNull(careTasks.doneAt) : undefined,
      gte(careTasks.date, dateStart),
      lte(careTasks.date, dateEnd),
    ),
  });
}

export function findCareTaskById(
  {
    id,
    teamId,
  }: {
    id: string;
    teamId: string;
  },
  db = _db,
) {
  return db.query.careTasks.findFirst({
    where: and(eq(careTasks.id, id), eq(careTasks.teamId, teamId)),
  });
}

export function deleteCareTaskById(
  {
    id,
    teamId,
  }: {
    id: string;
    teamId: string;
  },
  db = _db,
) {
  return db
    .delete(careTasks)
    .where(and(eq(careTasks.id, id), eq(careTasks.teamId, teamId)));
}

export async function deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
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
      and(
        eq(careTasks.teamId, teamId),
        eq(careTasks.createdFromCalendar, true),
        gte(careTasks.date, date),
      ),
    );
}

export async function deleteAllCareTasksForTeam(db: Drizzle, teamId: string) {
  await db.delete(careTasks).where(eq(careTasks.teamId, teamId));
}

export async function updateCareTask(
  { id, input }: Update<typeof zCareTaskUpdate>,
  db = _db,
) {
  //!Security risk
  await db.update(careTasks).set(input).where(eq(careTasks.id, id));
}

export function createCareTask(
  careTask: z.infer<typeof zCareTaskCreate>,
  db = _db,
) {
  return db.insert(careTasks).values(careTask).$returningId();
}

export async function createManyCareTasks(
  data: z.infer<typeof zCareTaskCreateMany>,
  db = _db,
) {
  await db.insert(careTasks).values(data);
}
