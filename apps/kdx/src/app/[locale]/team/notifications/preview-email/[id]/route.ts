import { notFound } from "next/navigation";

import { auth } from "@kdx/auth";
import { eq, sql } from "@kdx/db";
import { db } from "@kdx/db/client";
import { usersToTeams } from "@kdx/db/schema";
import { redirect } from "@kdx/locales/navigation";

const allTeamIdsForUserQuery = db
  .select({ id: usersToTeams.teamId })
  .from(usersToTeams)
  .where(eq(usersToTeams.userId, sql.placeholder("userId")));

const prepared = db.query.notifications
  .findFirst({
    where: (notifications, { eq, and, inArray }) =>
      and(
        eq(notifications.id, sql.placeholder("id")),
        eq(notifications.sentToUserId, sql.placeholder("userId")), //? Only show notifications for the logged in user
        inArray(notifications.teamId, allTeamIdsForUserQuery), //? Ensure user is part of the team this notification was sent to
      ),
    columns: {
      message: true,
      subject: true,
    },
  })
  .prepare();

export async function GET(request: Request) {
  const { user } = await auth();
  if (!user) return redirect("/");

  const notif = await prepared.execute({
    id: request.url.split("/").pop(),
    userId: user.id,
  });
  if (!notif) return notFound();

  return new Response(notif.message, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
