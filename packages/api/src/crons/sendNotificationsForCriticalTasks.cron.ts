import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";

import dayjs from "@kdx/dayjs";
import WarnDelayedCriticalTasks from "@kdx/react-email/warn-delayed-critical-tasks";
import { kodixCareAppId, objectGroupBy } from "@kdx/shared";

import { getCareTasks } from "../internal/caelndarAndCareTaskCentral";
import { sendNotifications } from "../internal/notificationCenter";
import { getUsersAppTeamConfigs } from "../trpc/routers/app/getUserAppTeamConfig.handler";
import { createCronJobCtx } from "./_utils";

const IS_LATE = (date: Date) => dayjs(date).utc().isBefore(dayjs().utc());

export const sendNotificationsForCriticalTasks = verifySignatureAppRouter(
  async () => {
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

    const usersThatNeedToBeNotifiedGroupedByTeamId = objectGroupBy(
      userConfigs.filter((x) => !!x.config?.sendNotificationsForDelayedTasks),
      "teamId",
    );

    for (const careTask of critialCareTasks) {
      if (!IS_LATE(careTask.date)) {
        continue;
      }

      for (const [teamId, users] of Object.entries(
        usersThatNeedToBeNotifiedGroupedByTeamId,
      )) {
        //send message
        for (const user of users) {
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
        }
      }
    }

    return Response.json({ success: true });
  },
);
