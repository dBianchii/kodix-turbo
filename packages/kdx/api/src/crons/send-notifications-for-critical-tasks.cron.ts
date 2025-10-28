import dayjs from "@kodix/dayjs";
import { kodixCareAppId } from "@kodix/shared/db";
import { getSuccessesAndErrors } from "@kodix/shared/utils";
import ms from "ms";
import groupBy from "object.groupby";

import { appRepository, teamRepository } from "@kdx/db/repositories";
import WarnDelayedCriticalTasks from "@kdx/react-email/warn-delayed-critical-tasks";

import {
  getCareTaskCompositeId,
  getCareTasks,
} from "../internal/calendar-and-care-task-central";
import { sendNotifications } from "../internal/notification-center";
import { getUpstashCache, setUpstashCache } from "../sdks/upstash";
import { verifiedQstashCron } from "./_utils";

const MILLISECONDS_TO_BE_LATE = ms("1h");
const isLate = (date: Date) =>
  dayjs(date)
    .utc()
    .isBefore(dayjs().add(MILLISECONDS_TO_BE_LATE, "milliseconds").utc());

export const sendNotificationsForCriticalTasks = verifiedQstashCron(
  async ({ ctx }) => {
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
        dateEnd: end,
        dateStart: start,
        onlyCritical: true,
        onlyNotDone: true,
        teamIds: allTeamIdsWithKodixCareInstalled.map((x) => x.teamId),
      })
    ).filter((x) => isLate(x.date)); //? We only want to notify about tasks that are late

    const usersWithinTheTeams = allTeamIdsWithKodixCareInstalled.flatMap((x) =>
      x.Team.UsersToTeams.flatMap((y) => y.userId),
    );

    const teamsWithCriticalNotDoneLateCareTasks =
      criticalNotDoneLateCareTasks.map((x) => x.teamId);

    const userConfigsWithEnabledNotif = (
      await appRepository.findUserAppTeamConfigs({
        appId: kodixCareAppId,
        teamIds: teamsWithCriticalNotDoneLateCareTasks,
        userIds: usersWithinTheTeams,
      })
    ).filter((x) => !!x.config?.sendNotificationsForDelayedTasks);

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
        // biome-ignore lint/suspicious/noAssignInExpressions: <biome migration>
        const userIds = (usersWithConfigsThatNeedToBeNotifiedGroupedByTeamId[
          team.teamId
        ] ??= []).map((cfg) => cfg.userId);

        //? This object should represent the care task with the team and the users that need to be notified.
        return {
          date: ct.date,
          eventMasterId: ct.eventMasterId,
          id: ct.id,
          Team: {
            teamId: team.teamId,
            userIds,
          },
          title: ct.title,
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
            channels: [
              {
                body: `The task "${careTask.title}" is late`,
                title: "Critical task is late",
                type: "PUSH_NOTIFICATIONS",
              },
            ],
            teamId: careTask.Team.teamId,
            userId,
          }),
        );
        promises.push(
          sendNotifications({
            channels: [
              {
                react: WarnDelayedCriticalTasks({
                  t: ctx.t,
                  taskTitle: careTask.title,
                }),
                subject: "Critical task is late",
                type: "EMAIL",
              },
            ],
            teamId: careTask.Team.teamId,
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
            value: {
              careTaskCompositeId,
              date: careTask.date.toISOString(),
              userId,
            },
            variableKeys: {
              careTaskCompositeId,
              userId,
            },
          }),
        );
      }
    }

    await Promise.allSettled(promises);

    return Response.json({ success: true });
  },
);
