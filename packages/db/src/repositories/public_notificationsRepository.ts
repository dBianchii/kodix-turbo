import type { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";

import type { zNotificationCreateMany } from "./_zodSchemas/notificationSchemas";
import { db } from "../client";
import { expoTokens, notifications, usersToTeams } from "../schema";

export function public_notificationsRepositoryFactory() {
  async function deleteUserNotifications({
    userId,
    ids,
  }: {
    userId: string;
    ids: string[];
  }) {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.sentToUserId, userId),
          inArray(notifications.id, ids),
        ),
      );
  }

  async function createExpoToken({
    token,
    userId,
  }: {
    token: string;
    userId: string;
  }) {
    await db.insert(expoTokens).values({ token, userId });
  }

  async function deleteManyExpoTokensByUserId({
    tokens,
    userId,
  }: {
    tokens: string[];
    userId: string;
  }) {
    await db
      .delete(expoTokens)
      .where(
        and(eq(expoTokens.userId, userId), inArray(expoTokens.id, tokens)),
      );
  }

  async function deleteManyExpoTokens({ tokens }: { tokens: string[] }) {
    await db.delete(expoTokens).where(inArray(expoTokens.id, tokens));
  }

  async function createManyNotifications(
    notifs: z.infer<typeof zNotificationCreateMany>,
  ) {
    await db.insert(notifications).values(notifs);
  }

  async function getUserNotificationById({
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

  return {
    getUserNotificationById,
    createManyNotifications,
    createExpoToken,
    deleteUserNotifications,
    deleteManyExpoTokensByUserId,
    deleteManyExpoTokens,
  };
}
