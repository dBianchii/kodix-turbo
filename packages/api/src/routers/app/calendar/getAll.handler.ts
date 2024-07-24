import { rrulestr } from "rrule";

import type { TGetAllInputSchema } from "@kdx/validators/trpc/app/calendar";
import dayjs from "@kdx/dayjs";
import { and, eq, gte, lte, or } from "@kdx/db";
import {
  eventCancellations,
  eventExceptions,
  eventMasters,
} from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllCalendarTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAllInputSchema;
}
export interface CalendarTask {
  title: string | undefined;
  description: string | undefined;
  date: Date;
  eventMasterId: string;
  eventExceptionId: string | undefined;
  originaDate?: Date | undefined;
  rule: string;
}

export const getAllHandler = async ({
  ctx,
  input,
}: GetAllCalendarTasksOptions) => {
  const _eventMasters = await ctx.db.query.eventMasters.findMany({
    where: (eventMasters, { and, gte, eq, or, lte, isNull }) =>
      and(
        eq(eventMasters.teamId, ctx.session.user.activeTeamId),
        and(
          lte(eventMasters.dateStart, input.dateEnd),
          or(
            gte(eventMasters.dateUntil, input.dateStart),
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
      rule: eventMasters.rule,
      eventMasterTitle: eventMasters.title,
      eventMasterDescription: eventMasters.description,
      eventMasterRule: eventMasters.rule,
    })
    .from(eventExceptions)
    .where((eventExceptions) =>
      and(
        eq(eventMasters.teamId, ctx.session.user.activeTeamId),
        or(
          and(
            gte(eventExceptions.originalDate, input.dateStart),
            lte(eventExceptions.originalDate, input.dateEnd),
          ),
          and(
            gte(eventExceptions.newDate, input.dateStart),
            lte(eventExceptions.newDate, input.dateEnd),
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
        eq(eventMasters.teamId, ctx.session.user.activeTeamId),
        and(
          gte(eventCancellations.originalDate, input.dateStart),
          lte(eventCancellations.originalDate, input.dateEnd),
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
    const allDates = rrule.between(input.dateStart, input.dateEnd, true);

    for (const date of allDates)
      calendarTasks.push({
        eventMasterId: eventMaster.id,
        eventExceptionId: undefined,
        title: eventMaster.title ?? undefined,
        description: eventMaster.description ?? undefined,
        date: date,
        rule: eventMaster.rule,
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
      date: eventException.newDate,
      originaDate: eventException.originalDate,
      rule: eventException.rule,
    });

  //we have exceptions and recurrences from masters in calendarTasks. Some master recurrences must be deleted.
  //because of the exception's change of date.
  calendarTasks = calendarTasks
    .map((calendarTask) => {
      if (calendarTask.eventExceptionId) {
        //handle exclusion of tasks that came from exceptions. (shouldnt appear if are outside selected range)
        if (
          dayjs(input.dateStart).isAfter(calendarTask.date) ||
          dayjs(input.dateEnd).isBefore(calendarTask.date)
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
};
