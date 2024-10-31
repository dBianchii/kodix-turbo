import { rrulestr } from "rrule";

import type { careTasks } from "@kdx/db/schema";
import dayjs from "@kdx/dayjs";
import { and, eq, gte, inArray, isNull, lte, or } from "@kdx/db";
import {
  eventCancellations,
  eventExceptions,
  eventMasters,
} from "@kdx/db/schema";
import { kodixCareAppId } from "@kdx/shared";

import type { TCronJobContext } from "../crons/_utils";
import type { TProtectedProcedureContext } from "../trpc/procedures";
import { getConfigs } from "../trpc/routers/app/getConfig.handler";

export interface CalendarTask {
  title: string | undefined;
  description: string | undefined;
  date: Date;
  eventMasterId: string;
  eventExceptionId: string | undefined;
  originaDate?: Date | undefined;
  rule: string;
  type: typeof eventMasters.$inferSelect.type;
  teamId: typeof eventMasters.$inferSelect.teamId;
  createdBy: typeof eventMasters.$inferSelect.createdBy;
}

export const getCalendarTaskCompositeId = (compound: {
  eventMasterId: string;
  selectedTimeStamp: Date;
}) => `${compound.eventMasterId}-${compound.selectedTimeStamp.toISOString()}`; //TODO: make other stuff for calendar api use this instead of sending selectedTimeStamp+eventMasterId for inputs

export async function getCalendarTasks({
  ctx,
  dateStart,
  dateEnd,
  teamIds,
  onlyCritical = false,
}: {
  ctx: TCronJobContext | TProtectedProcedureContext;
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
  onlyCritical?: boolean;
}) {
  if (!teamIds.length) throw new Error("teamIds must have at least one item");

  const _eventMasters = await ctx.db.query.eventMasters.findMany({
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

  //Handling Exceptions and Cancelations
  const _eventExceptions = await ctx.db
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

  const _eventCancelations = await ctx.db
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

  //* We have all needed data. Now, let's add all masters and exceptions to calendarTasks.

  let calendarTasks: CalendarTask[] = [];

  for (const eventMaster of _eventMasters) {
    const rrule = rrulestr(eventMaster.rule);
    const allDates = rrule.between(dateStart, dateEnd, true);

    for (const date of allDates)
      calendarTasks.push({
        eventMasterId: eventMaster.id,
        eventExceptionId: undefined,
        title: eventMaster.title ?? undefined,
        description: eventMaster.description ?? undefined,
        date: date,
        rule: eventMaster.rule,
        type: eventMaster.type,
        teamId: eventMaster.teamId,
        createdBy: eventMaster.createdBy,
      });
  }

  for (const eventException of _eventExceptions)
    calendarTasks.push({
      eventMasterId: eventException.eventMasterId,
      eventExceptionId: eventException.id,
      title:
        eventException.title ?? eventException.eventMasterTitle ?? undefined,
      description:
        eventException.description ??
        eventException.eventMasterDescription ??
        undefined,
      type: eventException.type ?? eventException.eventMasterType,
      date: eventException.newDate,
      originaDate: eventException.originalDate,
      rule: eventException.rule,
      teamId: eventException.eventMasterTeamId,
      createdBy: eventException.eventMasterCreatedBy,
    });

  //we have exceptions and recurrences from masters in calendarTasks. Some master recurrences must be deleted.
  //because of the exception's change of date.
  calendarTasks = calendarTasks
    .map((calendarTask) => {
      if (calendarTask.eventExceptionId) {
        //handle exclusion of tasks that came from exceptions. (shouldnt appear if are outside selected range)
        if (
          dayjs(dateStart).isAfter(calendarTask.date) ||
          dayjs(dateEnd).isBefore(calendarTask.date)
        )
          return null;
        return calendarTask;
      }
      //Cuidar de cancelamentos -> deletar os advindos do master
      const foundCancelation = _eventCancelations.some(
        (x) =>
          x.eventMasterId === calendarTask.eventMasterId &&
          dayjs(x.originalDate).isSame(calendarTask.date),
      );
      if (foundCancelation) return null;

      //For a calendarTask that came from master,
      //Delete it if it has an exception associated with it. (originalDate === calendartask date)
      const foundException = calendarTasks.some(
        (x) =>
          x.eventExceptionId &&
          x.eventMasterId === calendarTask.eventMasterId &&
          dayjs(calendarTask.date).isSame(x.originaDate, "day"),
      );
      if (foundException) return null;

      return calendarTask;
    })
    .filter((task): task is CalendarTask => !!task)
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });

  return calendarTasks;
}

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

type CareTaskOrCalendarTask = Omit<CareTask, "id"> & {
  id: string | null;
}; //? Same as CareTask but id might not exist when it's a calendar task

export const getCareTaskCompositeId = (compound: {
  id: string | null;
  eventMasterId: string | null;
  selectedTimeStamp: Date;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (!compound.eventMasterId) return compound.id!;
  return getCalendarTaskCompositeId({
    eventMasterId: compound.eventMasterId,
    selectedTimeStamp: compound.selectedTimeStamp,
  });
};

export async function getCareTasks({
  ctx,
  dateStart,
  dateEnd,
  teamIds,
  onlyCritical = false,
  onlyNotDone = false,
}: {
  ctx: TCronJobContext | TProtectedProcedureContext;
  dateStart: Date;
  dateEnd: Date;
  teamIds: string[];
  onlyCritical?: boolean;
  onlyNotDone?: boolean;
}) {
  if (!teamIds.length) throw new Error("teamIds must have at least one item");

  const calendarTasks = await getCalendarTasks({
    ctx,
    teamIds,
    onlyCritical,
    dateStart: dateStart,
    dateEnd: dateEnd,
  });

  const careTasks = (await ctx.db.query.careTasks.findMany({
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
  })) satisfies CareTask[];

  const teamConfigs = await getConfigs({
    ctx,
    appId: kodixCareAppId,
    teamIds,
  });

  let union: CareTaskOrCalendarTask[] = careTasks;
  if (!onlyNotDone) {
    union.push(
      ...calendarTasks
        .filter((ct) => {
          const cfgForThisCt = teamConfigs.find((x) => x.teamId === ct.teamId);
          if (!cfgForThisCt) return true; //? Shouldn't ever happen.
          //TODO: add sentry log here if it happens

          const clonedCareTasksUntil = cfgForThisCt.config.clonedCareTasksUntil;
          if (!clonedCareTasksUntil) return true;

          return dayjs(ct.date).isAfter(clonedCareTasksUntil);
        })
        .map((x) => ({
          id: null,
          eventMasterId: x.eventMasterId,
          teamId: x.teamId,
          title: x.title ?? null,
          description: x.description ?? null,
          date: x.date,
          type: x.type,
          doneAt: null,
          updatedAt: null,
          doneByUserId: null,
          details: null,
        })),
    );
  }
  union = union
    .filter((x) => (onlyNotDone ? !x.doneAt : true)) //? Filter onlyNotDone
    .sort((a, b) => a.date.getTime() - b.date.getTime()); //? Sort by ascending time

  return union;
}
