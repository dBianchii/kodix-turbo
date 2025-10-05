import dayjs from "@kodix/dayjs";
import { kodixCareAppId } from "@kodix/shared/db";
import { rrulestr } from "rrule";

import type { careTasks, eventMasters } from "@kdx/db/schema";
import {
  appRepository,
  calendarRepository,
  careTaskRepository,
} from "@kdx/db/repositories";

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
  if (!teamIds.length) throw new Error("teamIds must have at least one item");

  const calendarRepositoryInput = {
    dateEnd,
    dateStart,
    teamIds,
  };
  const [_eventMasters, _eventExceptions, _eventCancelations] =
    await Promise.all([
      calendarRepository.findEventMastersFromTo({
        ...calendarRepositoryInput,
        onlyCritical,
      }),
      calendarRepository.findEventExceptionsFromTo(calendarRepositoryInput),
      calendarRepository.findEventCancellationsFromTo(calendarRepositoryInput),
    ]);

  //* We have all needed data. Now, let's add all masters and exceptions to calendarTasks.
  let calendarTasks: CalendarTask[] = [];

  for (const eventMaster of _eventMasters) {
    const rrule = rrulestr(eventMaster.rule);
    const allDates = rrule.between(dateStart, dateEnd, true);

    for (const date of allDates)
      calendarTasks.push({
        createdBy: eventMaster.createdBy,
        date,
        description: eventMaster.description ?? undefined,
        eventExceptionId: undefined,
        eventMasterId: eventMaster.id,
        rule: eventMaster.rule,
        teamId: eventMaster.teamId,
        title: eventMaster.title ?? undefined,
        type: eventMaster.type,
      });
  }

  for (const eventException of _eventExceptions)
    calendarTasks.push({
      createdBy: eventException.eventMasterCreatedBy,
      date: eventException.newDate,
      description:
        eventException.description ??
        eventException.eventMasterDescription ??
        undefined,
      eventExceptionId: eventException.id,
      eventMasterId: eventException.eventMasterId,
      originaDate: eventException.originalDate,
      rule: eventException.rule,
      teamId: eventException.eventMasterTeamId,
      title:
        eventException.title ?? eventException.eventMasterTitle ?? undefined,
      type: eventException.type ?? eventException.eventMasterType,
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
  // biome-ignore lint/style/noNonNullAssertion: <fix me>
  if (!compound.eventMasterId) return compound.id!;
  return getCalendarTaskCompositeId({
    eventMasterId: compound.eventMasterId,
    selectedTimeStamp: compound.selectedTimeStamp,
  });
};

export async function getCareTasks({
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
  if (!teamIds.length) throw new Error("teamIds must have at least one item");

  const [calendarTasks, careTasks, teamConfigs] = await Promise.all([
    getCalendarTasks({
      dateEnd,
      dateStart,
      onlyCritical,
      teamIds,
    }),
    careTaskRepository.findCareTasksFromTo({
      dateEnd,
      dateStart,
      onlyCritical,
      onlyNotDone,
      teamIds,
    }),
    appRepository.findAppTeamConfigs({
      appId: kodixCareAppId,
      teamIds,
    }),
  ]);

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
          date: x.date,
          description: x.description ?? null,
          details: null,
          doneAt: null,
          doneByUserId: null,
          eventMasterId: x.eventMasterId,
          id: null,
          teamId: x.teamId,
          title: x.title ?? null,
          type: x.type,
          updatedAt: null,
        })),
    );
  }
  union = union
    .filter((x) => (onlyNotDone ? !x.doneAt : true)) //? Filter onlyNotDone
    .sort((a, b) => a.date.getTime() - b.date.getTime()); //? Sort by ascending time

  return union;
}
