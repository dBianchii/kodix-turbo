import type { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "../client";
import { expoTokens, notifications, usersToTeams } from "../schema";
import { zNotificationCreateMany } from "./_zodSchemas/notificationSchemas";

export async function deleteUserNotificationsWithinTeams({
  userId,
  teamIds,
}: {
  userId: string;
  teamIds: string[];
}) {
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.sentToUserId, userId),
        inArray(notifications.id, teamIds),
      ),
    );
}

export async function deleteManyExpoTokens(tokens: string[]) {
  await db.delete(expoTokens).where(inArray(expoTokens.id, tokens));
}

export async function createManyNotifications(
  notifs: z.infer<typeof zNotificationCreateMany>,
) {
  await db.insert(notifications).values(zNotificationCreateMany.parse(notifs));
}

export async function getUserNotificationById({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  const allTeamIdsForUserQuery = db
    .select({ id: usersToTeams.teamId })
    .from(usersToTeams)
    .where(eq(usersToTeams.userId, userId));

  return await db.query.notifications.findFirst({
    where: (notifications, { eq, and, inArray }) =>
      and(
        eq(notifications.id, notificationId),
        eq(notifications.sentToUserId, userId), //? Only show notifications for the logged in user
        inArray(notifications.teamId, allTeamIdsForUserQuery), //? Ensure user is part of the team this notification was sent to
      ),
    columns: {
      message: true,
      subject: true,
    },
  });
}
