import type { InferInsertModel } from "drizzle-orm";
import type { z } from "zod/v4";
import { and, asc, eq, inArray, sql } from "drizzle-orm";

import type {
  AppIdsWithUserAppTeamConfig,
  KodixAppId,
  kodixCareAppId,
} from "@kdx/shared";
import { appIdToAppTeamConfigSchema, todoAppId } from "@kdx/shared";

import type { Drizzle } from "../../client";
import type { appIdToUserAppTeamConfigSchemaUpdate } from "../_zodSchemas/userAppTeamConfigs";
import { db as _db } from "../../client";
import {
  appActivityLogs,
  apps,
  appsToTeams,
  appTeamConfigs,
  teams,
  userAppTeamConfigs,
  userTeamAppRoles,
} from "../../schema";
import { appIdToSchemas } from "../../utils";
import { appIdToUserAppTeamConfigSchema } from "../_zodSchemas/userAppTeamConfigs";

export async function findInstalledAppsByTeamId(
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

export async function createAppActivityLog(
  input: InferInsertModel<typeof appActivityLogs>,
  db = _db,
) {
  return db.insert(appActivityLogs).values(input);
}

export async function findInstalledApp(
  {
    teamId,
    appId,
  }: {
    teamId: string;
    appId: string;
  },
  db = _db,
) {
  const [installed] = await db
    .select({ id: apps.id })
    .from(apps)
    .innerJoin(appsToTeams, eq(appsToTeams.appId, apps.id))
    .innerJoin(teams, eq(teams.id, appsToTeams.teamId))
    .where(and(eq(teams.id, teamId), eq(apps.id, appId)));
  return installed;
}

export async function findAppTeamConfigs(
  {
    appId,
    teamIds,
  }: {
    appId: AppIdsWithUserAppTeamConfig;
    teamIds: string[];
  },
  db = _db,
) {
  const teamConfigs = await db.query.appTeamConfigs.findMany({
    where: (appteamConfig, { eq, and, inArray }) =>
      and(
        eq(appteamConfig.appId, appId),
        inArray(appteamConfig.teamId, teamIds),
      ),
    columns: {
      config: true,
      teamId: true,
    },
  });

  const schema = appIdToAppTeamConfigSchema[appId];
  const parsedTeamConfigs = teamConfigs.map((teamConfig) => ({
    teamId: teamConfig.teamId,
    config: schema.parse(teamConfig.config),
  }));

  return parsedTeamConfigs;
}

export async function upsertAppTeamConfig(
  {
    appId,
    teamId,
    config,
  }: {
    appId: AppIdsWithUserAppTeamConfig;
    teamId: string;
    config: Partial<
      z.infer<
        (typeof appIdToAppTeamConfigSchema)[typeof kodixCareAppId] //TODO: make dynamic based on app
      >
    >;
  },
  db = _db,
) {
  const existingConfig = await db.query.appTeamConfigs.findFirst({
    where: (appteamConfig, { eq, and }) =>
      and(eq(appteamConfig.appId, appId), eq(appteamConfig.teamId, teamId)),
    columns: {
      config: true,
    },
  });

  const configSchema = appIdToAppTeamConfigSchema[appId];
  if (existingConfig) {
    return await db
      .update(appTeamConfigs)
      .set({
        config: {
          ...configSchema.parse(existingConfig.config),
          ...config,
        },
      })
      .where(
        and(eq(appTeamConfigs.appId, appId), eq(appTeamConfigs.teamId, teamId)),
      );
  }

  //new record. We need to validate the whole config without partial()
  const parsedInput = configSchema.parse(config);
  await db.insert(appTeamConfigs).values({
    config: parsedInput,
    teamId: teamId,
    appId: appId,
  });
}

export async function findUserAppTeamConfigs(
  {
    appId,
    userIds,
    teamIds,
  }: {
    appId: AppIdsWithUserAppTeamConfig;
    userIds: string[];
    teamIds: string[];
  },
  db = _db,
) {
  const result = await db.query.userAppTeamConfigs.findMany({
    where: (userAppTeamConfigs, { eq, and }) =>
      and(
        eq(userAppTeamConfigs.appId, appId),
        inArray(userAppTeamConfigs.teamId, teamIds),
        inArray(userAppTeamConfigs.userId, userIds),
      ),
    columns: {
      userId: true,
      teamId: true,
      config: true,
    },
  });

  const schema = appIdToUserAppTeamConfigSchema[appId].optional(); //? Optional because the config may not exist yet

  const userAppTeamConfigs = result.map((x) => ({
    teamId: x.teamId,
    userId: x.userId,
    config: schema.parse(x.config),
  }));

  return userAppTeamConfigs;
}

export async function upsertUserAppTeamConfigs(
  {
    appId,
    userId,
    teamId,
    input,
  }: {
    appId: AppIdsWithUserAppTeamConfig;
    userId: string;
    teamId: string;
    input: z.infer<
      (typeof appIdToUserAppTeamConfigSchemaUpdate)[typeof kodixCareAppId] //TODO: make dynamic based on app
    >;
  },
  db = _db,
) {
  const existingConfig = await db.query.userAppTeamConfigs.findFirst({
    where: (userAppTeamConfigs, { eq, and }) =>
      and(
        eq(userAppTeamConfigs.appId, appId),
        eq(userAppTeamConfigs.teamId, teamId),
        eq(userAppTeamConfigs.userId, userId),
      ),
    columns: {
      config: true,
    },
  });

  const configSchema = appIdToUserAppTeamConfigSchema[appId];
  if (existingConfig) {
    return await db
      .update(userAppTeamConfigs)
      .set({
        config: {
          ...configSchema.parse(existingConfig.config),
          ...input,
        },
      })
      .where(
        and(
          eq(userAppTeamConfigs.appId, appId),
          eq(userAppTeamConfigs.teamId, teamId),
          eq(userAppTeamConfigs.userId, userId),
        ),
      );
  }

  //new record. We need to validate the whole config without partial()
  const parsedInput = configSchema.parse(input);

  await db.insert(userAppTeamConfigs).values({
    config: parsedInput,
    teamId: teamId,
    appId: appId,
    userId: userId,
  });
}

export async function installAppForTeam(
  {
    appId,
    teamId,
    userId,
  }: {
    appId: KodixAppId;
    teamId: string;
    userId: string;
  },
  db = _db,
) {
  await db.transaction(async (tx) => {
    await tx.insert(appsToTeams).values({
      appId: appId,
      teamId: teamId,
    });

    //? Make the user an admin for the app
    await tx.insert(userTeamAppRoles).values({
      appId: appId,
      teamId: teamId,
      role: "ADMIN",
      userId: userId,
    });
  });
}

export async function uninstallAppForTeam(
  db: Drizzle,
  {
    appId,
    teamId,
  }: {
    appId: KodixAppId;
    teamId: string;
  },
) {
  await db
    .delete(appsToTeams)
    .where(and(eq(appsToTeams.appId, appId), eq(appsToTeams.teamId, teamId)));
  await db
    .delete(userTeamAppRoles)
    .where(
      and(
        eq(userTeamAppRoles.appId, appId),
        eq(userTeamAppRoles.teamId, teamId),
      ),
    );
  await db
    .delete(appTeamConfigs)
    .where(
      and(eq(appTeamConfigs.appId, appId), eq(appTeamConfigs.teamId, teamId)),
    );

  await removeAppData({
    tx: db,
    appId: appId,
    teamId: teamId,
  });
}

export async function findManyAppActivityLogs(
  {
    tableNames,
    rowId,
    appId,
    teamId,
    page,
    pageSize,
  }: {
    tableNames?: (typeof appActivityLogs.$inferSelect.tableName)[];
    rowId?: string;
    appId: KodixAppId;
    teamId: string;
    page: number;
    pageSize: number;
  },
  db = _db,
) {
  const offset = (page - 1) * pageSize;
  return db.query.appActivityLogs.findMany({
    where: (appActivityLogs, { eq, inArray }) =>
      and(
        eq(appActivityLogs.appId, appId),
        eq(appActivityLogs.teamId, teamId),

        rowId ? eq(appActivityLogs.rowId, rowId) : undefined,
        tableNames ? inArray(appActivityLogs.tableName, tableNames) : undefined,
      ),
    orderBy: [asc(appActivityLogs.loggedAt)],
    limit: pageSize,
    offset: offset,
    with: {
      User: {
        columns: {
          name: true,
        },
      },
    },
  });
}

async function removeAppData({
  tx,
  appId,
  teamId,
}: {
  tx: Drizzle;
  appId: KodixAppId;
  teamId: string;
}) {
  const allSchemasForApp = appIdToSchemas[appId];

  for (const schema of Object.values(allSchemasForApp)) {
    if (!("teamId" in schema)) continue;
    await tx.delete(schema).where(eq(schema.teamId, teamId));
  }
}
