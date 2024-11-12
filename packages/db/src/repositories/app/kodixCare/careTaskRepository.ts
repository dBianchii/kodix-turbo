import type { z } from "zod";
import { and, eq, gte, isNull } from "drizzle-orm";

import type { Update } from "../../_types";
import type {
  zCareTaskCreate,
  zCareTaskCreateMany,
  zCareTaskUpdate,
} from "../../_zodSchemas/careTaskSchemas";
import type { DrizzleTeam, DrizzleTransaction } from "../../../client";
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

export const getCareTaskRepository = (
  _teamDb: DrizzleTeam | DrizzleTransaction,
) => ({
  async findCareTaskById(
    id: string,
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    return teamDb.query.careTasks.findFirst({
      where: (careTask, { eq }) => and(eq(careTask.id, id)),
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
  },

  async deleteCareTaskById(
    id: string,
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb.delete(careTasks).where(and(eq(careTasks.id, id)));
  },

  async deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
    date: Date,
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb
      .delete(careTasks)
      .where(
        and(eq(careTasks.createdFromCalendar, true), gte(careTasks.date, date)),
      );
  },

  async deleteAllCareTasksForTeam(
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb.delete(careTasks);
  },

  async updateCareTask(
    { id, input }: Update<typeof zCareTaskUpdate>,
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb.update(careTasks).set(input).where(eq(careTasks.id, id));
  },

  async createCareTask(
    careTask: z.infer<typeof zCareTaskCreate>,
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb.insert(careTasks).values(careTask);
  },

  async createManyCareTasks(
    data: z.infer<typeof zCareTaskCreateMany>,
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb.insert(careTasks).values(data);
  },

  async reassignCareTasksFromDateToShift(
    {
      previousCareShiftId,
      newCareShiftId,
      date,
    }: { previousCareShiftId: string; newCareShiftId: string; date: Date },
    teamDb: DrizzleTeam | DrizzleTransaction = _teamDb,
  ) {
    await teamDb
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
  },

  async findCareTasksFromTo(
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
    teamDb: DrizzleTeam,
  ) {
    const careTasks: CareTask[] = await teamDb.query.careTasks.findMany({
      where: (careTask, { gte, lte, and }) =>
        and(
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
  },
});
