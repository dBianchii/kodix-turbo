import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import ms from "ms";
import groupBy from "object.groupby";

import dayjs from "@kdx/dayjs";
import WarnDelayedCriticalTasks from "@kdx/react-email/warn-delayed-critical-tasks";
import { getSuccessesAndErrors, kodixCareAppId } from "@kdx/shared";

import { getCareTasks } from "../internal/calendarAndCareTaskCentral";
import { sendNotifications } from "../internal/notificationCenter";
import { getUpstashCache, setUpstashCache } from "../sdks/upstash";
import { getUsersAppTeamConfigs } from "../trpc/routers/app/getUserAppTeamConfig.handler";
import { createCronJobCtx } from "./_utils";

const MILLISECONDS_TO_BE_LATE = ms("1h");

const isLate = (date: Date) =>
  dayjs(date)
    .utc()
    .isBefore(dayjs().add(MILLISECONDS_TO_BE_LATE, "milliseconds").utc());

export const sendNotificationsForCriticalTasks = verifySignatureAppRouter(
  async () => {
    console.time("sendNotificationsForCriticalTasks");

    const ctx = createCronJobCtx();
    const allTeamIdsWithKodixCareInstalled =
      await ctx.db.query.appsToTeams.findMany({
        where: (appsToTeams, { eq }) => eq(appsToTeams.appId, kodixCareAppId),
        columns: {
          teamId: true,
        },
        with: {
          Team: {
            with: {
              UsersToTeams: {
                columns: {
                  userId: true,
                },
              },
            },
          },
        },
      });

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
        ctx,
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
      await getUsersAppTeamConfigs({
        ctx,
        appId: kodixCareAppId,
        teamIds: teamsWithCriticalNotDoneLateCareTasks,
        userIds: usersWithinTheTeams,
      })
    ).filter((x) => !!x.config?.sendNotificationsForDelayedTasks); //?Only users that have the config enabled

    const usersWithConfigsThatNeedToBeNotifiedGroupedByTeamId = groupBy(
      userConfigsWithEnabledNotif,
      (x) => x.teamId,
    );

    const getCareTaskIdOrEventMasterId = (careTask: {
      id: string | null;
      eventMasterId: string | null;
    }) => {
      const careTaskIdOrEventMasterId = careTask.id ?? careTask.eventMasterId;
      if (!careTaskIdOrEventMasterId) throw new Error("Shouldn't happen");
      return careTaskIdOrEventMasterId;
    };

    const criticalNotDoneLateCareTasksWithTeamAndUsers =
      criticalNotDoneLateCareTasks.map((ct) => {
        const team = allTeamIdsWithKodixCareInstalled.find(
          (x) => x.teamId === ct.teamId,
        );
        if (!team) throw new Error("Shouldn't happen");
        const userIds = (usersWithConfigsThatNeedToBeNotifiedGroupedByTeamId[
          team.teamId
        ] ??= []).map((cfg) => cfg.userId);

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
        careTask.Team.userIds.map((userId) =>
          getUpstashCache("careTasksUsersNotifs", {
            careTaskIdOrEventMasterId: getCareTaskIdOrEventMasterId(careTask),
            userId,
          }).then((alreadySentNotif) => ({
            careTaskOrEventMasterId: getCareTaskIdOrEventMasterId(careTask),
            userId,
            alreadySent: !!alreadySentNotif,
          })),
        ),
      );

    const results = await Promise.allSettled(sentNotificationStatusPromises);
    const { successes: notificationStatuses } = getSuccessesAndErrors(results);

    const criticalNotDoneLateCareTasksWithTeamAndUsersNotYetSent =
      criticalNotDoneLateCareTasksWithTeamAndUsers.filter(
        (careTask) =>
          !notificationStatuses.some(
            (x) =>
              x.value.careTaskOrEventMasterId ===
                getCareTaskIdOrEventMasterId(careTask) &&
              careTask.Team.userIds.some((userId) => userId === x.value.userId),
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
                type: "EMAIL",
                react: await WarnDelayedCriticalTasks({
                  task: {
                    date: careTask.date,
                    title: careTask.title,
                  },
                  locale: ctx.locale,
                }),
                subject: "Critical task is late",
              },
            ],
            userId,
          }),
        );
        const dateISOString = careTask.date.toISOString();
        const value = {
          date: dateISOString,
        };
        if (careTask.id)
          promises.push(
            setUpstashCache("careTasksUsersNotifs", {
              variableKeys: {
                userId,
                careTaskIdOrEventMasterId: careTask.id,
              },
              value,
            }),
          );

        if (careTask.eventMasterId)
          promises.push(
            setUpstashCache("careTasksUsersNotifs", {
              variableKeys: {
                userId,
                careTaskIdOrEventMasterId: careTask.eventMasterId,
              },
              value,
            }),
          );
      }
    }

    await Promise.allSettled(promises);

    console.timeEnd("sendNotificationsForCriticalTasks");

    return Response.json({ success: true });
  },
);
