import { rrulestr } from "rrule";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TGetAllInput } from "@kdx/validators/trpc/event";
import dayjs from "@kdx/dayjs";

interface GetAllCalendarTasksOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TGetAllInput;
}

export const getAllHandler = async ({
  ctx,
  input,
}: GetAllCalendarTasksOptions) => {
  const eventMasters = await ctx.prisma.eventMaster.findMany({
    where: {
      teamId: ctx.session.user.activeTeamId,
      AND: [
        {
          DateStart: {
            lte: input.dateEnd,
          },
        },
        {
          OR: [{ DateUntil: { gte: input.dateStart } }, { DateUntil: null }],
        },
      ],
    },
  });

  //Handling Exceptions and Cancelations
  const eventExceptions = await ctx.prisma.eventException.findMany({
    where: {
      EventMaster: {
        teamId: ctx.session.user.activeTeamId,
      },
      OR: [
        {
          originalDate: { gte: input.dateStart, lte: input.dateEnd },
        },
        {
          newDate: { gte: input.dateStart, lte: input.dateEnd },
        },
      ],
    },
    include: {
      EventMaster: {
        select: {
          rule: true,
          title: true,
          description: true,
        },
      },
    },
  });

  const eventCancelations = await ctx.prisma.eventCancellation.findMany({
    where: {
      EventMaster: {
        teamId: ctx.session.user.activeTeamId,
      },
      originalDate: {
        gte: input.dateStart,
        lte: input.dateEnd,
      },
    },
    include: {
      EventMaster: {
        select: {
          id: true,
        },
      },
    },
  });

  //* We have all needed data. Now, let's add all masters and exceptions to calendarTasks.
  interface CalendarTask {
    title: string | undefined;
    description: string | undefined;
    date: Date;
    eventMasterId: string;
    eventExceptionId: string | undefined;
    originaDate?: Date | undefined;
    rule: string;
  }
  let calendarTasks: CalendarTask[] = [];

  for (const eventMaster of eventMasters) {
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

  for (const eventException of eventExceptions)
    calendarTasks.push({
      eventMasterId: eventException.eventMasterId,
      eventExceptionId: eventException.id,
      title:
        eventException.title ?? eventException.EventMaster?.title ?? undefined,
      description:
        eventException?.description ??
        eventException.EventMaster?.description ??
        undefined,
      date: eventException.newDate,
      originaDate: eventException.originalDate,
      rule: eventException.EventMaster.rule,
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
      const foundCancelation = eventCancelations.some(
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
