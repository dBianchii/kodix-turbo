import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import ms from "ms";
import groupBy from "object.groupby";

import dayjs from "@kdx/dayjs";
import WarnDelayedCriticalTasks from "@kdx/react-email/warn-delayed-critical-tasks";
import { kodixCareAppId } from "@kdx/shared";

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

    const critialNotDoneCareTasks = await getCareTasks({
      ctx,
      dateStart: start,
      dateEnd: end,
      teamIds: allTeamIdsWithKodixCareInstalled.map((x) => x.teamId),
      onlyCritical: true,
      onlyNotDone: true,
    });

    const usersWithinTheTeams = allTeamIdsWithKodixCareInstalled.flatMap((x) =>
      x.Team.UsersToTeams.flatMap((x) => x.userId),
    );
    const teamsWithDelayedCriticalCareTasks = critialNotDoneCareTasks.map(
      (x) => x.teamId,
    );

    const userConfigs = await getUsersAppTeamConfigs({
      ctx,
      appId: kodixCareAppId,
      teamIds: teamsWithDelayedCriticalCareTasks,
      userIds: usersWithinTheTeams,
    });

    const usersThatNeedToBeNotifiedGroupedByTeamId = groupBy(
      userConfigs.filter((x) => !!x.config?.sendNotificationsForDelayedTasks),
      (x) => x.teamId,
    );

    const fails = [];

    for (const careTask of critialNotDoneCareTasks) {
      if (!isLate(careTask.date)) {
        continue;
      }
      for (const [teamId, users] of Object.entries(
        usersThatNeedToBeNotifiedGroupedByTeamId,
      )) {
        for (const user of users) {
          const careTaskIdOrEventMasterId =
            careTask.id ?? careTask.eventMasterId;

          if (!careTaskIdOrEventMasterId) {
            fails.push({ careTask, user, teamId }); //? Shouldn't ever happen. But if it does, we need to know.
            continue;
          }

          const upstashCacheVariableKey = {
            careTaskIdOrEventMasterId,
            userId: user.userId,
          };

          const alreadySentNotif = await getUpstashCache(
            "careTasksUsersNotifs",
            upstashCacheVariableKey,
          );
          if (alreadySentNotif) continue;

          const promises: Promise<unknown>[] = [
            sendNotifications({
              teamId,
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
              userId: user.userId,
            }),
          ];
          if (careTask.id) {
            promises.push(
              setUpstashCache("careTasksUsersNotifs", {
                variableKeys: {
                  ...upstashCacheVariableKey,
                  careTaskIdOrEventMasterId: careTask.id,
                },
                value: {
                  date: careTask.date.toISOString(),
                },
              }),
            );
          }
          if (careTask.eventMasterId) {
            promises.push(
              setUpstashCache("careTasksUsersNotifs", {
                variableKeys: {
                  ...upstashCacheVariableKey,
                  careTaskIdOrEventMasterId: careTask.eventMasterId,
                },
                value: {
                  date: careTask.date.toISOString(),
                },
              }),
            );
          }

          void Promise.allSettled(promises);
        }
      }
    }

    if (fails.length) {
      //TODO: add sentry log here if it happens
      console.error("Failed to send notifications for critical tasks", fails);
    }

    console.timeEnd("sendNotificationsForCriticalTasks");

    return Response.json({ success: true });
  },
);
