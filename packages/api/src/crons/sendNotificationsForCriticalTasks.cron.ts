import ms from "ms";
import groupBy from "object.groupby";

import dayjs from "@kdx/dayjs";
import { appRepository, teamRepository } from "@kdx/db/repositories";
import WarnDelayedCriticalTasks from "@kdx/react-email/warn-delayed-critical-tasks";
import { getSuccessesAndErrors, kodixCareAppId } from "@kdx/shared";

import {
  getCareTaskCompositeId,
  getCareTasks,
} from "../internal/calendarAndCareTaskCentral";
import { sendNotifications } from "../internal/notificationCenter";
import { getUpstashCache, setUpstashCache } from "../sdks/upstash";
import { verifiedQstashCron } from "./_utils";

const MILLISECONDS_TO_BE_LATE = ms("1h");
const isLate = (date: Date) =>
  dayjs(date)
    .utc()
    .isBefore(dayjs().add(MILLISECONDS_TO_BE_LATE, "milliseconds").utc());

export const sendNotificationsForCriticalTasks = verifiedQstashCron(
  async ({ ctx }) => {
    console.time("sendNotificationsForCriticalTasks");

    const allTeamIdsWithKodixCareInstalled =
      await teamRepository.findAllTeamsWithAppInstalled(kodixCareAppId);

    const start = dayjs
      .utc()
      .add((-MILLISECONDS_TO_BE_LATE / 2) * 3, "milliseconds") // 1.5 hours ago
      .toDate();
    const end = dayjs
      .utc()
      .add(-MILLISECONDS_TO_BE_LATE, "milliseconds") // 1 hour ago
      .toDate();

    const criticalNotDoneLateCareTasks = (
      await getCareTasks({
        dateStart: start,
        dateEnd: end,
        teamIds: allTeamIdsWithKodixCareInstalled.map((x) => x.teamId),
        onlyCritical: true,
        onlyNotDone: true,
      })
    ).filter((x) => isLate(x.date)); //? We only want to notify about tasks that are late

    const usersWithinTheTeams = allTeamIdsWithKodixCareInstalled.flatMap((x) =>
      x.Team.UsersToTeams.flatMap((x) => x.userId),
    );

    const teamsWithCriticalNotDoneLateCareTasks =
      criticalNotDoneLateCareTasks.map((x) => x.teamId);

    const userConfigsWithEnabledNotif = (
      await appRepository.findUserAppTeamConfigs({
        appId: kodixCareAppId,
        teamIds: teamsWithCriticalNotDoneLateCareTasks,
        userIds: usersWithinTheTeams,
      })
    ).filter((x) => {
      // Verificar se o config tem a propriedade sendNotificationsForDelayedTasks (é do KodixCare)
      return !!(
        x.config &&
        "sendNotificationsForDelayedTasks" in x.config &&
        x.config.sendNotificationsForDelayedTasks
      );
    });

    const usersWithConfigsThatNeedToBeNotifiedGroupedByTeamId = groupBy(
      userConfigsWithEnabledNotif,
      (x) => x.teamId,
    );

    const criticalNotDoneLateCareTasksWithTeamAndUsers =
      criticalNotDoneLateCareTasks.map((ct) => {
        const team = allTeamIdsWithKodixCareInstalled.find(
          (x) => x.teamId === ct.teamId,
        );
        if (!team) throw new Error("Shouldn't happen");
        const userIds = (usersWithConfigsThatNeedToBeNotifiedGroupedByTeamId[
          team.teamId
        ] ??= []).map((cfg) => cfg.userId);

        //? This object should represent the care task with the team and the users that need to be notified.
        return {
          id: ct.id,
          eventMasterId: ct.eventMasterId,
          date: ct.date,
          title: ct.title,
          Team: {
            teamId: team.teamId,
            userIds,
          },
        };
      });

    const sentNotificationStatusPromises =
      criticalNotDoneLateCareTasksWithTeamAndUsers.flatMap((careTask) =>
        careTask.Team.userIds.map((userId) => {
          const careTaskCompositeId = getCareTaskCompositeId({
            eventMasterId: careTask.eventMasterId,
            id: careTask.id,
            selectedTimeStamp: careTask.date,
          });

          return getUpstashCache("careTasksUsersNotifs", {
            careTaskCompositeId,
            userId,
          });
        }),
      );

    const results = await Promise.allSettled(sentNotificationStatusPromises);
    const { successes: notificationStatuses } = getSuccessesAndErrors(results);

    const criticalNotDoneLateCareTasksWithTeamAndUsersNotYetSent =
      criticalNotDoneLateCareTasksWithTeamAndUsers.filter(
        (careTask) =>
          !notificationStatuses.some(
            (x) =>
              x.value?.careTaskCompositeId === //?Check if it exists and also if it's the same care task
              getCareTaskCompositeId({
                eventMasterId: careTask.eventMasterId,
                id: careTask.id,
                selectedTimeStamp: careTask.date,
              }),
          ),
      );

    const promises: Promise<unknown>[] = [];
    for (const careTask of criticalNotDoneLateCareTasksWithTeamAndUsersNotYetSent) {
      for (const userId of careTask.Team.userIds) {
        promises.push(
          sendNotifications({
            teamId: careTask.Team.teamId,
            channels: [
              {
                type: "PUSH_NOTIFICATIONS",
                title: "Critical task is late",
                body: `The task "${careTask.title}" is late`,
              },
            ],
            userId,
          }),
        );
        promises.push(
          sendNotifications({
            teamId: careTask.Team.teamId,
            channels: [
              {
                type: "EMAIL",
                react: WarnDelayedCriticalTasks({
                  taskTitle: careTask.title,
                  t: ctx.t,
                }),
                subject: "Critical task is late",
              },
            ],
            userId,
          }),
        );
        const careTaskCompositeId = getCareTaskCompositeId({
          eventMasterId: careTask.eventMasterId,
          id: careTask.id,
          selectedTimeStamp: careTask.date,
        });
        promises.push(
          setUpstashCache("careTasksUsersNotifs", {
            variableKeys: {
              userId,
              careTaskCompositeId,
            },
            value: {
              userId,
              careTaskCompositeId,
              date: careTask.date.toISOString(),
            },
          }),
        );
      }
    }

    await Promise.allSettled(promises);

    console.timeEnd("sendNotificationsForCriticalTasks");

    return Response.json({ success: true });
  },
);
