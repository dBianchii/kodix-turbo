import { and, eq, inArray } from "drizzle-orm";

import { db } from "../client";
import { notifications } from "../schema";

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
