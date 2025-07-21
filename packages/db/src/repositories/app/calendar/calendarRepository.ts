import type { SQL } from "drizzle-orm";
import type { z } from "zod/v4";
import { and, eq, gt, gte, inArray, lte, or } from "drizzle-orm";

import type { Drizzle } from "../../../client";
import type { UpdateWithTeamId } from "../../_types";
import type { zEventCancellationCreate } from "../../_zodSchemas/eventCancellationSchemas";
import type {
  zEventExceptionCreate,
  zEventExceptionUpdate,
} from "../../_zodSchemas/eventExceptionSchema";
import type {
  zEventMasterCreate,
  zEventMasterUpdate,
} from "../../_zodSchemas/eventMasterSchemas";
import { db } from "../../../client";
import {
  eventCancellations,
  eventExceptions,
  eventMasters,
} from "../../../schema";

export async function findEventMastersFromTo({
  dateStart,
  dateEnd,
  teamIds,
  onlyCritical = false,
}: {
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
  onlyCritical?: boolean;
}) {
  return await db.query.eventMasters.findMany({
    where: (eventMasters, { and, gte, eq, or, lte, isNull }) =>
      and(
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

export async function findEventExceptionsFromTo({
  dateStart,
  dateEnd,
  teamIds,
}: {
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
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

export async function findEventCancellationsFromTo({
  dateStart,
  dateEnd,
  teamIds,
}: {
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
}) {
  return db
    .select({
      originalDate: eventCancellations.originalDate,
      eventMasterId: eventMasters.id,
    })
    .from(eventCancellations)
    .where((eventCancellations) =>
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

export async function findEventExceptionById(db: Drizzle, id: string) {
  return db.query.eventExceptions.findFirst({
    where: (eventExceptions, { eq }) => eq(eventExceptions.id, id),
    columns: {
      eventMasterId: true,
      originalDate: true,
    },
  });
}

export async function updateEventMasterById(
  db: Drizzle,
  { id, input, teamId }: UpdateWithTeamId<typeof zEventMasterUpdate>,
) {
  return db
    .update(eventMasters)
    .set(input)
    .where(and(eq(eventMasters.id, id), eq(eventMasters.teamId, teamId)));
}

export async function updateEventExceptionById(
  db: Drizzle,
  { id, teamId, input }: UpdateWithTeamId<typeof zEventExceptionUpdate>,
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

export async function updateManyEventExceptionsByEventMasterId(
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

export async function createEventCancellation(
  db: Drizzle,
  input: z.infer<typeof zEventCancellationCreate>,
) {
  return db.insert(eventCancellations).values(input);
}

export async function createEventException(
  db: Drizzle,
  input: z.infer<typeof zEventExceptionCreate>,
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

export async function findEventMasterById(
  db: Drizzle,
  { id, teamId }: { id: string; teamId: string },
) {
  return db.query.eventMasters.findFirst({
    where: and(eq(eventMasters.teamId, teamId), eq(eventMasters.id, id)),
    columns: {
      id: true,
      title: true,
      description: true,
      rule: true,
      dateStart: true,
    },
  });
}
