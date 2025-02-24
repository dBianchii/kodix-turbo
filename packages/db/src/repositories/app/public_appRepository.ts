import { eq, sql } from "drizzle-orm";

import { todoAppId } from "@kdx/shared";

import { db as _db } from "../../client";
import { apps, appsToTeams } from "../../schema";

export function public_appRepositoryFactory() {
  async function findAllTeamsWithAppInstalled(appId: string, db = _db) {
    const allTeamIdsWithKodixCareInstalled =
      await db.query.appsToTeams.findMany({
        where: (appsToTeams, { eq }) => eq(appsToTeams.appId, appId),
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

    return allTeamIdsWithKodixCareInstalled;
  }

  async function findInstalledAppsByTeamId(
    teamId: string | undefined,
    db = _db,
  ) {
    const _apps = await db
      .select({
        id: apps.id,
        ...(teamId && {
          installed: sql`EXISTS(SELECT 1 FROM ${appsToTeams} WHERE ${eq(
            apps.id,
            appsToTeams.appId,
          )} AND ${eq(appsToTeams.teamId, teamId)})`, //? If user is logged in, we select 1 or 0
        }),
      })
      .from(apps)
      .then((res) => {
        if (teamId)
          return res.map((x) => ({
            ...x,
            installed: !!x.installed, //? And then we convert it to boolean. Javascript is amazing /s
          }));
        return res.map((x) => ({
          ...x,
          installed: false, //? If user is not logged in, we set it to false
        }));
      });
    return _apps.filter((app) => app.id !== todoAppId); //TODO: stinky
  }

  return {
    findInstalledAppsByTeamId,
    findAllTeamsWithAppInstalled,
  };
}
