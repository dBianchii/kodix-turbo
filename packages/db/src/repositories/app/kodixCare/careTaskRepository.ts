import type { SQLWrapper } from "drizzle-orm";
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
export class CareTaskRepository {
  private teamIds: string[];

  constructor(teamIds: string[]) {
    this.teamIds = teamIds;
  }

  private withinTeams(...conditions: (SQLWrapper | undefined)[]) {
    const teamExpression =
      this.teamIds.length === 1
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          eq(careTasks.teamId, this.teamIds[0]!)
        : inArray(careTasks.teamId, this.teamIds);

    if (!conditions.length) return teamExpression;

    return and(teamExpression, ...conditions);
  }

  async findCareTasksFromTo({
    dateStart,
    dateEnd,
    onlyCritical = false,
    onlyNotDone = false,
  }: {
    dateStart: Date;
    dateEnd: Date;
    onlyCritical?: boolean;
    onlyNotDone?: boolean;
  }) {
    const careTasks: CareTask[] = await db.query.careTasks.findMany({
      where: (careTask, { gte, lte }) =>
        this.withinTeams(
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

  async findCareTaskById(id: string) {
    return db.query.careTasks.findFirst({
      where: (careTask, { eq }) => this.withinTeams(eq(careTask.id, id)),
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

  async deleteCareTaskById(id: string) {
    await db.delete(careTasks).where(this.withinTeams(eq(careTasks.id, id)));
  }

  async deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
    date: Date,
    db: Drizzle,
  ) {
    await db
      .delete(careTasks)
      .where(
        this.withinTeams(
          eq(careTasks.createdFromCalendar, true),
          gte(careTasks.date, date),
        ),
      );
  }

  async deleteAllCareTasksForTeam(db: Drizzle) {
    await db.delete(careTasks).where(this.withinTeams());
  }

  async updateCareTaskById(
    { id, input }: Update<typeof zCareTaskUpdate>,
    db: Drizzle,
  ) {
    await db
      .update(careTasks)
      .set(input)
      .where(this.withinTeams(eq(careTasks.id, id)));
  }

  async createCareTask(db: Drizzle, careTask: z.infer<typeof zCareTaskCreate>) {
    await db.insert(careTasks).values(careTask);
  }

  async createManyCareTasks(
    db: Drizzle,
    data: z.infer<typeof zCareTaskCreateMany>,
  ) {
    await db.insert(careTasks).values(data);
  }

  async reassignCareTasksFromDateToShift(
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
        this.withinTeams(
          gte(careTasks.date, date),
          eq(careTasks.careShiftId, previousCareShiftId),
        ),
      );
  }
}
