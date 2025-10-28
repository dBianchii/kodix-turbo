import type { SQL } from "drizzle-orm";
import type { z } from "zod";
import { and, eq, gt, gte, inArray, isNull, lte, or } from "drizzle-orm";

import type { Drizzle } from "../../../client";
import type { UpdateWithTeamId } from "../../_types";
import type { zEventCancellationCreate } from "../../_zodSchemas/event-cancellation-schemas";
import type {
  zEventExceptionCreate,
  zEventExceptionUpdate,
} from "../../_zodSchemas/event-exception-schemas";
import type {
  zEventMasterCreate,
  zEventMasterUpdate,
} from "../../_zodSchemas/event-master-schemas";
import { db as _db } from "../../../client";
import {
  eventCancellations,
  eventExceptions,
  eventMasters,
} from "../../../schema";

export function findEventMastersFromTo({
  dateStart,
  dateEnd,
  teamIds,
  onlyCritical = false,
  db = _db,
}: {
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
  onlyCritical?: boolean;
  db?: Drizzle;
}) {
  return db.query.eventMasters.findMany({
    where: and(
      onlyCritical ? eq(eventMasters.type, "CRITICAL") : undefined,
      inArray(eventMasters.teamId, teamIds),
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

export function findEventExceptionsFromTo({
  dateStart,
  dateEnd,
  teamIds,
  db = _db,
}: {
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
  db?: Drizzle;
}) {
  return db
    .select({
      description: eventExceptions.description,
      eventMasterCreatedBy: eventMasters.createdBy,
      eventMasterDescription: eventMasters.description,
      eventMasterId: eventExceptions.eventMasterId,
      eventMasterRule: eventMasters.rule,
      eventMasterTeamId: eventMasters.teamId,
      eventMasterTitle: eventMasters.title,
      eventMasterType: eventMasters.type,
      id: eventExceptions.id,
      newDate: eventExceptions.newDate,
      originalDate: eventExceptions.originalDate,
      rule: eventMasters.rule,
      title: eventExceptions.title,
      type: eventExceptions.type,
    })
    .from(eventExceptions)
    .where(
      and(
        inArray(eventMasters.teamId, teamIds),
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

export function findEventCancellationsFromTo({
  dateStart,
  dateEnd,
  teamIds,
  db = _db,
}: {
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
  db?: Drizzle;
}) {
  return db
    .select({
      eventMasterId: eventMasters.id,
      originalDate: eventCancellations.originalDate,
    })
    .from(eventCancellations)
    .where(
      and(
        inArray(eventMasters.teamId, teamIds),
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

export function findEventExceptionById(id: string, db = _db) {
  return db.query.eventExceptions.findFirst({
    columns: {
      eventMasterId: true,
      originalDate: true,
    },
    where: eq(eventExceptions.id, id),
  });
}

export function updateEventMasterById(
  { id, input, teamId }: UpdateWithTeamId<typeof zEventMasterUpdate>,
  db = _db,
) {
  return db
    .update(eventMasters)
    .set(input)
    .where(and(eq(eventMasters.id, id), eq(eventMasters.teamId, teamId)));
}

export async function updateEventExceptionById(
  { id, teamId, input }: UpdateWithTeamId<typeof zEventExceptionUpdate>,
  db = _db,
) {
  const allEventMastersIdsForThisTeamQuery = db
    .select({ id: eventMasters.id })
    .from(eventMasters)
    .where(eq(eventMasters.teamId, teamId));

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

export function updateManyEventExceptionsByEventMasterId(
  {
    eventMasterId,
    input,
  }: {
    eventMasterId: string;
    input: z.infer<typeof zEventExceptionUpdate>;
  },
  db = _db,
) {
  return db
    .update(eventExceptions)
    .set(input)
    .where(eq(eventExceptions.eventMasterId, eventMasterId));
}

export function createEventCancellation(
  input: z.infer<typeof zEventCancellationCreate>,
  db: Drizzle,
) {
  return db.insert(eventCancellations).values(input);
}

export function createEventException(
  input: z.infer<typeof zEventExceptionCreate>,
  db: Drizzle,
) {
  return db.insert(eventExceptions).values(input);
}

export async function createEventMaster(
  db: Drizzle,
  input: z.infer<typeof zEventMasterCreate>,
) {
  await db.insert(eventMasters).values(input);
}

export async function deleteEventExceptionById(db: Drizzle, id: string) {
  await db.delete(eventExceptions).where(eq(eventExceptions.id, id));
}

export async function deleteEventMasterById(db: Drizzle, id: string) {
  await db.delete(eventMasters).where(eq(eventMasters.id, id));
}

export async function deleteEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
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
export async function deleteEventExceptionsByMasterIdWithNewDateHigherThan(
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

export async function updateEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
  db: Drizzle,
  {
    input,
    date,
    eventMasterId,
    teamId,
  }: Omit<UpdateWithTeamId<typeof zEventExceptionUpdate>, "id"> & {
    eventMasterId: string;
    date: Date;
  },
) {
  const allEventMastersIdsForThisTeamQuery = db
    .select({ id: eventMasters.id })
    .from(eventMasters)
    .where(eq(eventMasters.teamId, teamId));

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

export async function deleteEventExceptionsHigherThanDate(
  //TODO: Revise this!! Why do we send both eventExceptionId and date?
  db: Drizzle,
  {
    teamId,
    date,
    eventExceptionId,
  }: {
    teamId: string;
    date: Date;
    eventExceptionId: string;
  },
) {
  const allEventMastersIdsForThisTeamQuery = db
    .select({ id: eventMasters.id })
    .from(eventMasters)
    .where(eq(eventMasters.teamId, teamId));

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

export function findEventMasterById(
  { id, teamId }: { id: string; teamId: string },
  db: Drizzle,
) {
  return db.query.eventMasters.findFirst({
    columns: {
      dateStart: true,
      description: true,
      id: true,
      rule: true,
      title: true,
    },
    where: and(eq(eventMasters.teamId, teamId), eq(eventMasters.id, id)),
  });
}
