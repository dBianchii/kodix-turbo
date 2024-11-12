import type { z } from "zod";
import { and, eq, gte, inArray, isNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareTaskCreate,
  zCareTaskCreateMany,
  zCareTaskUpdate,
} from "../../_zodSchemas/careTaskSchemas";
import type { Drizzle } from "../../../client";
import { db } from "../../../client";
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

export async function findCareTasksFromTo({
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
}) {
  const careTasks: CareTask[] = await db.query.careTasks.findMany({
    where: (careTask, { gte, lte, and }) =>
      and(
        inArray(careTask.teamId, teamIds),
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

export async function findCareTaskById({
  id,
  teamId,
}: {
  id: string;
  teamId: string;
}) {
  return db.query.careTasks.findFirst({
    where: (careTask, { eq }) =>
      and(eq(careTask.id, id), eq(careTask.teamId, teamId)),
    columns: {
      careShiftId: true,
      createdBy: true,
      createdFromCalendar: true,
    },
    with: {
      CareShift: {
        columns: {
          shiftEndedAt: true,
        },
      },
    },
  });
}

export async function deleteCareTaskById({
  id,
  teamId,
}: {
  id: string;
  teamId: string;
}) {
  await db
    .delete(careTasks)
    .where(and(eq(careTasks.id, id), eq(careTasks.teamId, teamId)));
}

export async function deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
  db: Drizzle,
  {
    teamId,
    date,
  }: {
    teamId: string;
    date: Date;
  },
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
  db: Drizzle,
  { id, input }: Update<typeof zCareTaskUpdate>,
) {
  //!Security risk
  await db.update(careTasks).set(input).where(eq(careTasks.id, id));
}

export async function createCareTask(
  db: Drizzle,
  careTask: z.infer<typeof zCareTaskCreate>,
) {
  await db.insert(careTasks).values(careTask);
}

export async function createManyCareTasks(
  db: Drizzle,
  data: z.infer<typeof zCareTaskCreateMany>,
) {
  await db.insert(careTasks).values(data);
}

export async function reassignCareTasksFromDateToShift(
  db: Drizzle,
  {
    previousCareShiftId,
    newCareShiftId,
    date,
  }: { previousCareShiftId: string; newCareShiftId: string; date: Date },
) {
  await db
    .update(careTasks)
    .set({
      careShiftId: newCareShiftId,
    })
    .where(
      and(
        gte(careTasks.date, date),
        eq(careTasks.careShiftId, previousCareShiftId),
      ),
    );
}
