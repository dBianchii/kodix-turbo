import { redirect } from "next/navigation";

import type { PrismaClient } from "@kdx/db";
import type { KodixAppId } from "@kdx/shared";
import { auth } from "@kdx/auth";
import { and, db, eq, schema } from "@kdx/db";

/**
 * @description Sees if user has this app on current team, if not, redirects to /apps
 */
export const redirectIfAppNotInstalled = async ({
  appId,
  prisma,
  customRedirect,
}: {
  appId: KodixAppId;
  prisma: PrismaClient;
  customRedirect?: string;
}) => {
  const session = await auth();
  if (!session) redirect("/");

  // const installed = await prisma.app.findUnique({
  //   where: {
  //     id: appId,
  //     Teams: {
  //       some: {
  //         id: session.user.activeTeamId,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //   },
  // });
  const installed = await db
    .select({})
    .from(schema.apps)
    .innerJoin(schema.appsToTeams, eq(schema.appsToTeams.appId, schema.apps.id))
    .innerJoin(schema.teams, eq(schema.teams.id, schema.appsToTeams.teamId))
    .where(
      and(
        eq(schema.teams.id, session.user.activeTeamId),
        eq(schema.apps.id, appId),
      ),
    )
    .then((res) => res[0]);

  if (!installed) redirect(customRedirect ?? "/apps");

  return session;
};
