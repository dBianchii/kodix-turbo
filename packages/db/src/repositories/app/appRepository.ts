import type { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";

import type { KodixAppId, kodixCareAppId } from "@kdx/shared";

import type {
  AppIdsWithUserAppTeamConfig,
  appIdToAppTeamConfigSchemaUpdate,
} from "../_zodSchemas/appTeamConfigSchemas";
import type { appIdToUserAppTeamConfigSchemaUpdate } from "../_zodSchemas/userAppTeamConfigs";
import type { Drizzle } from "../../client";
import { appIdToAppTeamConfigSchema } from "../_zodSchemas/appTeamConfigSchemas";
import { appIdToUserAppTeamConfigSchema } from "../_zodSchemas/userAppTeamConfigs";
import { db } from "../../client";
import {
  apps,
  appsToTeams,
  appTeamConfigs,
  teamAppRoles,
  userAppTeamConfigs,
} from "../../schema";
import { appIdToSchemas } from "../../utils";

export async function findInstalledAppsByTeamId(teamId: string | undefined) {
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
  return _apps;
}
export async function getAppTeamConfigs({
  appId,
  teamIds,
}: {
  appId: AppIdsWithUserAppTeamConfig;
  teamIds: string[];
}) {
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

export async function upsertAppTeamConfig({
  appId,
  teamId,
  config,
}: {
  appId: AppIdsWithUserAppTeamConfig;
  teamId: string;
  config: z.infer<
    (typeof appIdToAppTeamConfigSchemaUpdate)[typeof kodixCareAppId] //TODO: make dynamic based on app
  >;
}) {
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

export async function getUserAppTeamConfigs({
  appId,
  userIds,
  teamIds,
}: {
  appId: AppIdsWithUserAppTeamConfig;
  userIds: string[];
  teamIds: string[];
}) {
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

export async function upsertUserAppTeamConfigs({
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
}) {
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
    .delete(teamAppRoles)
    .where(and(eq(teamAppRoles.appId, appId), eq(teamAppRoles.teamId, teamId)));
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
