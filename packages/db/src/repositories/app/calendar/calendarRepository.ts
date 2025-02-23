import type { SQL } from "drizzle-orm";
import type { z } from "zod";
import { and, eq, gt, gte, inArray, lte, or } from "drizzle-orm";

import type { Update } from "../../_types";
import type { zEventCancellationCreate } from "../../_zodSchemas/eventCancellationSchemas";
import type {
  zEventExceptionCreate,
  zEventExceptionUpdate,
} from "../../_zodSchemas/eventExceptionSchema";
import type {
  zEventMasterCreate,
  zEventMasterUpdate,
} from "../../_zodSchemas/eventMasterSchemas";
import type { Drizzle } from "../../../client";
import { db } from "../../../client";
import {
  eventCancellations,
  eventExceptions,
  eventMasters,
} from "../../../schema";
import { assertTeamIdInList, createWithinTeamsForTable } from "../../utils";

export function calendarRepositoryFactory(teamIds: string[]) {
  const withinTeamsEventMasters = createWithinTeamsForTable(
    teamIds,
    eventMasters,
  );

  async function findEventMastersFromTo({
    dateStart,
    dateEnd,
    onlyCritical = false,
  }: {
    dateStart: Date;
    dateEnd: Date;
    onlyCritical?: boolean;
  }) {
    return await db.query.eventMasters.findMany({
      where: (eventMasters, { and, gte, eq, or, lte, isNull }) =>
        withinTeamsEventMasters(
          onlyCritical ? eq(eventMasters.type, "CRITICAL") : undefined,
          and(
            lte(eventMasters.dateStart, dateEnd),
            or(
              gte(eventMasters.dateUntil, dateStart),
              isNull(eventMasters.dateUntil),
            ),
          ),
        ),
    });
  }

  async function findEventExceptionsFromTo({
    dateStart,
    dateEnd,
  }: {
    dateStart: Date;
    dateEnd: Date;
  }) {
    return db
      .select({
        id: eventExceptions.id,
        eventMasterId: eventExceptions.eventMasterId,
        originalDate: eventExceptions.originalDate,
        newDate: eventExceptions.newDate,
        title: eventExceptions.title,
        description: eventExceptions.description,
        type: eventExceptions.type,
        rule: eventMasters.rule,
        eventMasterTitle: eventMasters.title,
        eventMasterDescription: eventMasters.description,
        eventMasterType: eventMasters.type,
        eventMasterRule: eventMasters.rule,
        eventMasterTeamId: eventMasters.teamId,
        eventMasterCreatedBy: eventMasters.createdBy,
      })
      .from(eventExceptions)
      .where((eventExceptions) =>
        withinTeamsEventMasters(
          or(
            and(
              gte(eventExceptions.originalDate, dateStart),
              lte(eventExceptions.originalDate, dateEnd),
            ),
            and(
              gte(eventExceptions.newDate, dateStart),
              lte(eventExceptions.newDate, dateEnd),
            ),
          ),
        ),
      )
      .innerJoin(
        eventMasters,
        eq(eventMasters.id, eventExceptions.eventMasterId),
      );
  }

  async function findEventCancellationsFromTo({
    dateStart,
    dateEnd,
  }: {
    dateStart: Date;
    dateEnd: Date;
  }) {
    return db
      .select({
        originalDate: eventCancellations.originalDate,
        eventMasterId: eventMasters.id,
      })
      .from(eventCancellations)
      .where((eventCancellations) =>
        withinTeamsEventMasters(
          and(
            gte(eventCancellations.originalDate, dateStart),
            lte(eventCancellations.originalDate, dateEnd),
          ),
        ),
      )
      .innerJoin(
        eventMasters,
        eq(eventMasters.id, eventCancellations.eventMasterId),
      );
  }

  async function findEventExceptionById(db: Drizzle, id: string) {
    return db.query.eventExceptions.findFirst({
      where: (eventExceptions, { eq }) => eq(eventExceptions.id, id),
      columns: {
        eventMasterId: true,
        originalDate: true,
      },
    });
  }

  async function updateEventMasterById(
    db: Drizzle,
    { id, input }: Update<typeof zEventMasterUpdate>,
  ) {
    return db
      .update(eventMasters)
      .set(input)
      .where(withinTeamsEventMasters(eq(eventMasters.id, id)));
  }

  async function updateEventExceptionById(
    db: Drizzle,
    { id, input }: Update<typeof zEventExceptionUpdate>,
  ) {
    const allEventMastersIdsForThisTeamQuery = db
      .select({ id: eventMasters.id })
      .from(eventMasters)
      .where(withinTeamsEventMasters());

    await db
      .update(eventExceptions)
      .set(input)
      .where(
        and(
          inArray(
            eventExceptions.eventMasterId,
            allEventMastersIdsForThisTeamQuery,
          ),
          eq(eventExceptions.id, id),
        ),
      );
  }

  async function updateManyEventExceptionsByEventMasterId(
    db: Drizzle,
    {
      eventMasterId,
      input,
    }: {
      eventMasterId: string;
      input: z.infer<typeof zEventExceptionUpdate>;
    },
  ) {
    return db
      .update(eventExceptions)
      .set(input)
      .where(eq(eventExceptions.eventMasterId, eventMasterId));
  }

  async function createEventCancellation(
    db: Drizzle,
    input: z.infer<typeof zEventCancellationCreate>,
  ) {
    return db.insert(eventCancellations).values(input);
  }

  async function createEventException(
    db: Drizzle,
    input: z.infer<typeof zEventExceptionCreate>,
  ) {
    return db.insert(eventExceptions).values(input);
  }

  async function createEventMaster(
    db: Drizzle,
    input: z.infer<typeof zEventMasterCreate>,
  ) {
    assertTeamIdInList(input, teamIds);
    await db.insert(eventMasters).values(input);
  }

  async function deleteEventExceptionById(db: Drizzle, id: string) {
    await db.delete(eventExceptions).where(eq(eventExceptions.id, id));
  }

  async function deleteEventMasterById(db: Drizzle, id: string) {
    await db
      .delete(eventMasters)
      .where(withinTeamsEventMasters(eq(eventMasters.id, id)));
  }

  async function deleteEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
    db: Drizzle,
    {
      eventMasterId,
      date,
    }: {
      eventMasterId: string;
      date: Date;
    },
  ) {
    await db
      .delete(eventExceptions)
      .where(
        and(
          eq(eventExceptions.eventMasterId, eventMasterId),
          gte(eventExceptions.newDate, date),
        ),
      );
  }
  async function deleteEventExceptionsByMasterIdWithNewDateHigherThan(
    db: Drizzle,
    {
      eventMasterId,
      date,
    }: {
      eventMasterId: string;
      date?: Date;
    },
  ) {
    const where: SQL[] = [eq(eventExceptions.eventMasterId, eventMasterId)];
    if (date) where.push(gt(eventExceptions.newDate, date));

    await db.delete(eventExceptions).where(and(...where));
  }

  async function updateEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
    db: Drizzle,
    {
      input,
      date,
      eventMasterId,
    }: Omit<Update<typeof zEventExceptionUpdate>, "id"> & {
      eventMasterId: string;
      date: Date;
    },
  ) {
    const allEventMastersIdsForThisTeamQuery = db
      .select({ id: eventMasters.id })
      .from(eventMasters)
      .where(withinTeamsEventMasters());

    await db
      .update(eventExceptions)
      .set(input)
      .where(
        and(
          inArray(
            eventExceptions.eventMasterId,
            allEventMastersIdsForThisTeamQuery,
          ),
          eq(eventExceptions.eventMasterId, eventMasterId),
          gte(eventExceptions.newDate, date),
        ),
      );
  }

  async function deleteEventExceptionsHigherThanDate( //TODO: Revise this!! Why do we send both eventExceptionId and date?
    db: Drizzle,
    {
      date,
      eventExceptionId,
    }: {
      date: Date;
      eventExceptionId: string;
    },
  ) {
    const allEventMastersIdsForThisTeamQuery = db
      .select({ id: eventMasters.id })
      .from(eventMasters)
      .where(withinTeamsEventMasters());

    await db
      .delete(eventExceptions)
      .where(
        and(
          inArray(
            eventExceptions.eventMasterId,
            allEventMastersIdsForThisTeamQuery,
          ),
          eq(eventExceptions.id, eventExceptionId),
          gte(eventExceptions.newDate, date),
        ),
      );
  }

  async function findEventMasterById(db: Drizzle, { id }: { id: string }) {
    return db.query.eventMasters.findFirst({
      where: withinTeamsEventMasters(eq(eventMasters.id, id)),
      columns: {
        id: true,
        title: true,
        description: true,
        rule: true,
        dateStart: true,
      },
    });
  }

  return {
    findEventMastersFromTo,
    findEventExceptionsFromTo,
    findEventCancellationsFromTo,
    findEventExceptionById,
    updateEventMasterById,
    updateEventExceptionById,
    updateManyEventExceptionsByEventMasterId,
    createEventCancellation,
    createEventException,
    createEventMaster,
    deleteEventExceptionById,
    deleteEventMasterById,
    deleteEventExceptionsByMasterIdWithNewDateHigherOrEqualThan,
    deleteEventExceptionsByMasterIdWithNewDateHigherThan,
    updateEventExceptionsByMasterIdWithNewDateHigherOrEqualThan,
    deleteEventExceptionsHigherThanDate,
    findEventMasterById,
  };
}
