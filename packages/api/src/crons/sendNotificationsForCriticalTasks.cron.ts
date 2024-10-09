import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import groupBy from "object.groupby";

import dayjs from "@kdx/dayjs";
import WarnDelayedCriticalTasks from "@kdx/react-email/warn-delayed-critical-tasks";
import { kodixCareAppId } from "@kdx/shared";

import { getCareTasks } from "../internal/caelndarAndCareTaskCentral";
import { sendNotifications } from "../internal/notificationCenter";
import { getUpstashCache, setUpstashCache } from "../sdks/upstash";
import { getUsersAppTeamConfigs } from "../trpc/routers/app/getUserAppTeamConfig.handler";
import { createCronJobCtx } from "./_utils";

const IS_LATE = (date: Date) =>
  dayjs(date).utc().isBefore(dayjs().add(-1, "hour").utc());

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

    const start = dayjs.utc().add(-2, "hour").toDate(); // 2 hours ago
    const end = dayjs.utc().toDate(); // now
    const critialCareTasks = await getCareTasks({
      ctx,
      dateStart: start,
      dateEnd: end,
      onlyCritical: true,
      teamIds: allTeamIdsWithKodixCareInstalled.map((x) => x.teamId),
    });

    const usersWithinTheTeams = allTeamIdsWithKodixCareInstalled.flatMap((x) =>
      x.Team.UsersToTeams.flatMap((x) => x.userId),
    );
    const teamsWithCriticalCareTasks = critialCareTasks.map((x) => x.teamId);

    const userConfigs = await getUsersAppTeamConfigs({
      ctx,
      appId: kodixCareAppId,
      teamIds: teamsWithCriticalCareTasks,
      userIds: usersWithinTheTeams,
    });

    const usersThatNeedToBeNotifiedGroupedByTeamId = groupBy(
      userConfigs.filter((x) => !!x.config?.sendNotificationsForDelayedTasks),
      (x) => x.teamId,
    );

    const fails = [];
    for (const careTask of critialCareTasks) {
      if (!IS_LATE(careTask.date)) {
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
            //TODO: add sentry log here if it happens
            continue;
          }

          const alreadySentNotif = await getUpstashCache(
            "careTasksUsersNotifs",
            {
              careTaskIdOrEventMasterId,
              userId: user.userId,
            },
          );
          if (alreadySentNotif) continue;

          await sendNotifications({
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
          });
          await setUpstashCache("careTasksUsersNotifs", {
            variableKeys: {
              userId: user.userId,
              careTaskIdOrEventMasterId,
            },
            value: {
              date: careTask.date.toISOString(),
            },
          });
        }
      }
    }

    console.timeEnd("sendNotificationsForCriticalTasks");

    return Response.json({ success: true });
  },
);
