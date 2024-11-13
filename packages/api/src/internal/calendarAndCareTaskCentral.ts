import { rrulestr } from "rrule";

import type { CareTaskRepository } from "@kdx/db/repositories";
import type { careTasks, eventMasters } from "@kdx/db/schema";
import dayjs from "@kdx/dayjs";
import {
  appRepository,
  calendarRepository,
  careTaskRepository,
} from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

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
};

export class CalendarService {
  constructor(
    private calendarRepo = calendarRepository,
    private careTaskRepo: CareTaskRepository,
    private appRepo = appRepository,
  ) {}

  getCalendarTaskCompositeId(compound: {
    eventMasterId: string;
    selectedTimeStamp: Date;
  }) {
    return `${compound.eventMasterId}-${compound.selectedTimeStamp.toISOString()}`;
  }

  async getCalendarTasks({
    dateStart,
    dateEnd,
    teamIds,
    onlyCritical = false,
  }: {
    dateStart: Date;
    dateEnd: Date;
    teamIds: string[];
    onlyCritical?: boolean;
  }): Promise<CalendarTask[]> {
    if (!teamIds.length) throw new Error("teamIds must have at least one item");

    const calendarRepositoryInput = {
      dateStart,
      dateEnd,
      teamIds,
    };

    const [_eventMasters, _eventExceptions, _eventCancelations] =
      await Promise.all([
        this.calendarRepo.findEventMastersFromTo({
          ...calendarRepositoryInput,
          onlyCritical,
        }),
        this.calendarRepo.findEventExceptionsFromTo(calendarRepositoryInput),
        this.calendarRepo.findEventCancellationsFromTo(calendarRepositoryInput),
      ]);

    let calendarTasks: CalendarTask[] = [];

    // Populate calendar tasks with event masters and exceptions
    for (const eventMaster of _eventMasters) {
      const rrule = rrulestr(eventMaster.rule);
      const allDates = rrule.between(dateStart, dateEnd, true);

      for (const date of allDates) {
        calendarTasks.push({
          eventMasterId: eventMaster.id,
          eventExceptionId: undefined,
          title: eventMaster.title ?? undefined,
          description: eventMaster.description ?? undefined,
          date,
          rule: eventMaster.rule,
          type: eventMaster.type,
          teamId: eventMaster.teamId,
          createdBy: eventMaster.createdBy,
        });
      }
    }

    for (const eventException of _eventExceptions) {
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
    }

    // Handle cancellations and exceptions
    calendarTasks = this.removeCanceledAndDuplicateTasks(
      calendarTasks,
      _eventCancelations,
    );
    return calendarTasks;
  }

  private removeCanceledAndDuplicateTasks(
    calendarTasks: CalendarTask[],
    _eventCancelations: any[],
  ) {
    return calendarTasks
      .map((calendarTask) => {
        if (calendarTask.eventExceptionId) {
          if (
            dayjs(dateStart).isAfter(calendarTask.date) ||
            dayjs(dateEnd).isBefore(calendarTask.date)
          )
            return null;
          return calendarTask;
        }

        const foundCancelation = _eventCancelations.some(
          (x) =>
            x.eventMasterId === calendarTask.eventMasterId &&
            dayjs(x.originalDate).isSame(calendarTask.date),
        );
        if (foundCancelation) return null;

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
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getCareTasks({
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
  }): Promise<CareTaskOrCalendarTask[]> {
    if (!teamIds.length) throw new Error("teamIds must have at least one item");

    const [calendarTasks, careTasks, teamConfigs] = await Promise.all([
      this.getCalendarTasks({ dateStart, dateEnd, teamIds, onlyCritical }),
      this.careTaskRepo.findCareTasksFromTo({
        dateStart,
        dateEnd,
        teamIds,
        onlyCritical,
        onlyNotDone,
      }),
      this.appRepo.findAppTeamConfigs({ appId: kodixCareAppId, teamIds }),
    ]);

    const union: CareTaskOrCalendarTask[] = careTasks;

    if (!onlyNotDone) {
      union.push(
        ...calendarTasks
          .filter((ct) => this.shouldIncludeCalendarTask(ct, teamConfigs))
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

    return union
      .filter((x) => (onlyNotDone ? !x.doneAt : true))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private shouldIncludeCalendarTask(ct: CalendarTask, teamConfigs: any[]) {
    const cfgForThisCt = teamConfigs.find((x) => x.teamId === ct.teamId);
    if (!cfgForThisCt) return true;
    const clonedCareTasksUntil = cfgForThisCt.config.clonedCareTasksUntil;
    return clonedCareTasksUntil
      ? dayjs(ct.date).isAfter(clonedCareTasksUntil)
      : true;
  }
}
