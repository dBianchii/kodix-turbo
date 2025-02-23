import type { InferInsertModel } from "drizzle-orm";
import type { z } from "zod";
import { and, asc, eq, inArray } from "drizzle-orm";

import type {
  AppIdsWithUserAppTeamConfig,
  KodixAppId,
  kodixCareAppId,
} from "@kdx/shared";
import { appIdToAppTeamConfigSchema } from "@kdx/shared";

import type { appIdToUserAppTeamConfigSchemaUpdate } from "../_zodSchemas/userAppTeamConfigs";
import type { Drizzle } from "../../client";
import { appIdToUserAppTeamConfigSchema } from "../_zodSchemas/userAppTeamConfigs";
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
import {
  assertTeamIdInList,
  createWithinTeams,
  createWithinTeamsForTable,
} from "../utils";

export function appRepositoryFactory(teamIds: string[]) {
  const withinTeams = createWithinTeams(teamIds);

  const withinTeamsAppTeamConfig = createWithinTeamsForTable(
    teamIds,
    appTeamConfigs,
  );
  const withinTeamsUserAppTeamConfig = createWithinTeamsForTable(
    teamIds,
    userAppTeamConfigs,
  );
  const withinTeamsAppActivityLogs = createWithinTeamsForTable(
    teamIds,
    appActivityLogs,
  );

  async function createAppActivityLog(
    input: InferInsertModel<typeof appActivityLogs>,
    db = _db,
  ) {
    assertTeamIdInList(input, teamIds);
    return db.insert(appActivityLogs).values(input);
  }

  async function findInstalledApp(
    {
      appId,
    }: {
      appId: string;
    },
    db = _db,
  ) {
    const [installed] = await db
      .select({ id: apps.id })
      .from(apps)
      .innerJoin(appsToTeams, eq(appsToTeams.appId, apps.id))
      .innerJoin(teams, eq(teams.id, appsToTeams.teamId))
      .where(withinTeams(eq(apps.id, appId)));
    return installed;
  }

  async function findAppTeamConfigs(
    {
      appId,
    }: {
      appId: AppIdsWithUserAppTeamConfig;
    },
    db = _db,
  ) {
    const teamConfigs = await db.query.appTeamConfigs.findMany({
      where: (appteamConfig, { eq }) =>
        withinTeamsAppTeamConfig(eq(appteamConfig.appId, appId)),
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

  async function upsertAppTeamConfig(
    {
      appId,
      config,
    }: {
      appId: AppIdsWithUserAppTeamConfig;
      config: Partial<
        z.infer<
          (typeof appIdToAppTeamConfigSchema)[typeof kodixCareAppId] //TODO: make dynamic based on app
        >
      >;
    },
    db = _db,
  ) {
    const existingConfig = await db.query.appTeamConfigs.findFirst({
      where: (appteamConfig, { eq }) =>
        withinTeamsAppTeamConfig(eq(appteamConfig.appId, appId)),
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
        .where(withinTeamsAppTeamConfig(eq(appTeamConfigs.appId, appId)));
    }

    //new record. We need to validate the whole config without partial()
    const parsedInput = configSchema.parse(config);
    await db.insert(appTeamConfigs).values(
      teamIds.map((teamId) => ({
        config: parsedInput,
        teamId: teamId,
        appId: appId,
      })),
    );
  }

  async function findUserAppTeamConfigs(
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
      where: (userAppTeamConfigs, { eq }) =>
        and(
          inArray(userAppTeamConfigs.teamId, teamIds),
          eq(userAppTeamConfigs.appId, appId),
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

  async function upsertUserAppTeamConfigs(
    {
      appId,
      userId,
      input,
    }: {
      appId: AppIdsWithUserAppTeamConfig;
      userId: string;
      input: z.infer<
        (typeof appIdToUserAppTeamConfigSchemaUpdate)[typeof kodixCareAppId] //TODO: make dynamic based on app
      >;
    },
    db = _db,
  ) {
    if (teamIds.length > 1)
      throw new Error(
        "upsertUserAppTeamConfigs can only be used for a single team",
      );

    const existingConfig = await db.query.userAppTeamConfigs.findFirst({
      where: (userAppTeamConfigs, { eq }) =>
        withinTeamsUserAppTeamConfig(
          eq(userAppTeamConfigs.appId, appId),
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
          withinTeamsUserAppTeamConfig(
            eq(userAppTeamConfigs.appId, appId),
            eq(userAppTeamConfigs.userId, userId),
          ),
        );
    }

    //new record. We need to validate the whole config without partial()
    const parsedInput = configSchema.parse(input);

    await db.insert(userAppTeamConfigs).values({
      config: parsedInput,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      teamId: teamIds[0]!,
      appId: appId,
      userId: userId,
    });
  }

  async function installAppForTeam(
    {
      appId,
      userId,
    }: {
      appId: KodixAppId;
      userId: string;
    },
    db = _db,
  ) {
    if (teamIds.length > 1)
      throw new Error("installAppForTeam can only be used for a single team");

    const teamId = teamIds[0]; //? Only one team can install an app at a time
    if (!teamId) {
      throw new Error("No teamId found");
    }

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

  async function uninstallAppForTeam(
    {
      appId,
    }: {
      appId: KodixAppId;
    },
    db = _db,
  ) {
    if (teamIds.length > 1)
      throw new Error("uninstallAppForTeam can only be used for a single team");
    const teamId = teamIds[0]; //? Only one team can uninstall an app at a time
    if (!teamId) {
      throw new Error("No teamId found");
    }

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
    });
  }

  async function findManyAppActivityLogs(
    {
      tableNames,
      rowId,
      appId,
      page,
      pageSize,
    }: {
      tableNames?: (typeof appActivityLogs.$inferSelect.tableName)[];
      rowId?: string;
      appId: KodixAppId;
      page: number;
      pageSize: number;
    },
    db = _db,
  ) {
    const offset = (page - 1) * pageSize;
    return db.query.appActivityLogs.findMany({
      where: (appActivityLogs, { eq, inArray }) =>
        withinTeamsAppActivityLogs(
          eq(appActivityLogs.appId, appId),
          rowId ? eq(appActivityLogs.rowId, rowId) : undefined,
          tableNames
            ? inArray(appActivityLogs.tableName, tableNames)
            : undefined,
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
  }: {
    tx: Drizzle;
    appId: KodixAppId;
  }) {
    if (teamIds.length > 1)
      throw new Error("removeAppData can only be used for a single team");

    const teamId = teamIds[0];
    if (!teamId) {
      throw new Error("No teamId found");
    }

    const allSchemasForApp = appIdToSchemas[appId];

    for (const schema of Object.values(allSchemasForApp)) {
      if (!("teamId" in schema)) continue;
      await tx.delete(schema).where(eq(schema.teamId, teamId));
    }
  }

  return {
    createAppActivityLog,
    findInstalledApp,
    findAppTeamConfigs,
    upsertAppTeamConfig,
    findUserAppTeamConfigs,
    upsertUserAppTeamConfigs,
    installAppForTeam,
    uninstallAppForTeam,
    findManyAppActivityLogs,
  };
}
