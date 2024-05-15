import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { db, eq, sql } from "@kdx/db";
import { schema } from "@kdx/db/schema";

const allTeamIdsForUserQuery = db
  .select({ id: schema.usersToTeams.teamId })
  .from(schema.usersToTeams)
  .where(eq(schema.usersToTeams.userId, sql.placeholder("userId")));

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
  const session = await auth();
  if (!session) redirect("/");

  const notif = await prepared.execute({
    id: request.url.split("/").pop(),
    userId: session.user.id,
  });
  if (!notif) return notFound();

  return new Response(notif.message, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
