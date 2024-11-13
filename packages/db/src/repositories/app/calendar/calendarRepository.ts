import type { SQL } from "drizzle-orm";
import type { z } from "zod";
import { and, eq, gt, gte, lte, or } from "drizzle-orm";

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
import type { DrizzleTeam, DrizzleTeamTransaction } from "../../../client";
import {
  eventCancellations,
  eventExceptions,
  eventMasters,
} from "../../../schema";

export const getCalendarRepository = (
  _teamDb: DrizzleTeam | DrizzleTeamTransaction,
) => ({
  async findEventExceptionById(
    id: string,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    return teamDb.query.eventExceptions.findFirst({
      where: (eventExceptions, { eq }) => eq(eventExceptions.id, id),
      columns: {
        eventMasterId: true,
        originalDate: true,
      },
    });
  },

  async updateEventMasterById(
    { id, input }: Update<typeof zEventMasterUpdate>,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    return teamDb
      .update(eventMasters)
      .set(input)
      .where(eq(eventMasters.id, id));
  },

  async updateEventExceptionById(
    { id, input }: Update<typeof zEventExceptionUpdate>,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    await teamDb
      .update(eventExceptions)
      .set(input)
      .where(eq(eventExceptions.id, id));
  },

  async updateManyEventExceptionsByEventMasterId(
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
    {
      eventMasterId,
      input,
    }: {
      eventMasterId: string;
      input: z.infer<typeof zEventExceptionUpdate>;
    },
  ) {
    return teamDb
      .update(eventExceptions)
      .set(input)
      .where(eq(eventExceptions.eventMasterId, eventMasterId));
  },

  async createEventCancellation(
    input: z.infer<typeof zEventCancellationCreate>,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    return teamDb.insert(eventCancellations).values(input);
  },

  async createEventException(
    input: z.infer<typeof zEventExceptionCreate>,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    return teamDb.insert(eventExceptions).values(input);
  },

  async createEventMaster(
    input: z.infer<typeof zEventMasterCreate>,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    await teamDb.insert(eventMasters).values(input);
  },

  async deleteEventExceptionById(
    id: string,
    teamDb: DrizzleTeamTransaction | DrizzleTeam = _teamDb,
  ) {
    await teamDb.delete(eventExceptions).where(eq(eventExceptions.id, id));
  },

  async deleteEventMasterById(
    id: string,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    await teamDb.delete(eventMasters).where(eq(eventMasters.id, id));
  },

  async deleteEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
    {
      eventMasterId,
      date,
    }: {
      eventMasterId: string;
      date: Date;
    },
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    await teamDb
      .delete(eventExceptions)
      .where(
        and(
          eq(eventExceptions.eventMasterId, eventMasterId),
          gte(eventExceptions.newDate, date),
        ),
      );
  },
  async deleteEventExceptionsByMasterIdWithNewDateHigherThan(
    {
      eventMasterId,
      date,
    }: {
      eventMasterId: string;
      date?: Date;
    },
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    const where: SQL[] = [eq(eventExceptions.eventMasterId, eventMasterId)];
    if (date) where.push(gt(eventExceptions.newDate, date));

    await teamDb.delete(eventExceptions).where(and(...where));
  },

  async updateEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
    {
      input,
      date,
      eventMasterId,
    }: Omit<Update<typeof zEventExceptionUpdate>, "id"> & {
      eventMasterId: string;
      date: Date;
    },
  ) {
    await teamDb
      .update(eventExceptions)
      .set(input)
      .where(
        and(
          eq(eventExceptions.eventMasterId, eventMasterId),
          gte(eventExceptions.newDate, date),
        ),
      );
  },

  async deleteEventExceptionsHigherThanDate(
    //TODO: Revise this!! Why do we send both eventExceptionId and date?
    {
      date,
      eventExceptionId,
    }: {
      date: Date;
      eventExceptionId: string;
    },
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    await teamDb
      .delete(eventExceptions)
      .where(
        and(
          eq(eventExceptions.id, eventExceptionId),
          gte(eventExceptions.newDate, date),
        ),
      );
  },

  async findEventMasterById(
    id: string,
    teamDb: DrizzleTeam | DrizzleTeamTransaction = _teamDb,
  ) {
    return teamDb.query.eventMasters.findFirst({
      where: and(eq(eventMasters.id, id)),
      columns: {
        id: true,
        title: true,
        description: true,
        rule: true,
        dateStart: true,
      },
    });
  },

  async findEventMastersFromTo(
    {
      dateStart,
      dateEnd,
      onlyCritical = false,
    }: {
      dateStart: Date;
      dateEnd: Date;
      onlyCritical?: boolean;
    },
    teamDb: DrizzleTeam | DrizzleTeamTransaction,
  ) {
    return await teamDb.query.eventMasters.findMany({
      where: (eventMasters, { and, gte, eq, or, lte, isNull }) =>
        and(
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
  },

  async findEventExceptionsFromTo(
    {
      dateStart,
      dateEnd,
    }: {
      dateStart: Date;
      dateEnd: Date;
    },
    teamDb: DrizzleTeam | DrizzleTeamTransaction,
  ) {
    return teamDb
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
  },

  async findEventCancellationsFromTo(
    {
      dateStart,
      dateEnd,
    }: {
      dateStart: Date;
      dateEnd: Date;
    },
    db: DrizzleTeam | DrizzleTeamTransaction,
  ) {
    return db
      .select({
        originalDate: eventCancellations.originalDate,
        eventMasterId: eventMasters.id,
      })
      .from(eventCancellations)
      .where((eventCancellations) =>
        and(
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
  },
});
