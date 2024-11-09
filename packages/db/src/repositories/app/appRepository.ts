import type { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";

import type { KodixAppId } from "@kdx/shared";
import type { AppIdsWithUserAppTeamConfig } from "@kdx/validators/trpc/app";
import {
  appIdToAdminRole_defaultIdMap,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";
import { appIdToAppTeamConfigSchema } from "@kdx/validators";

import type { appIdToUserAppTeamConfigSchemaUpdate } from "../_zodSchemas/userAppTeamConfigs";
import type { Drizzle } from "../../client";
import { zAppPermissionToTeamAppRoleCreateMany } from "../_zodSchemas/appPermissionsToTeamAppRolesSchemas";
import { appIdToUserAppTeamConfigSchema } from "../_zodSchemas/userAppTeamConfigs";
import { db } from "../../client";
import { appRoles_defaultTree } from "../../constants";
import { nanoid } from "../../nanoid";
import {
  appPermissions,
  appPermissionsToTeamAppRoles,
  apps,
  appsToTeams,
  appTeamConfigs,
  teamAppRoles,
  teamAppRolesToUsers,
  teams,
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
  return _apps.filter((app) => app.id !== todoAppId); //TODO: stinky
}

export async function findInstalledApp({
  teamId,
  appId,
}: {
  teamId: string;
  appId: string;
}) {
  const [installed] = await db
    .select({ id: apps.id })
    .from(apps)
    .innerJoin(appsToTeams, eq(appsToTeams.appId, apps.id))
    .innerJoin(teams, eq(teams.id, appsToTeams.teamId))
    .where(and(eq(teams.id, teamId), eq(apps.id, appId)));
  return installed;
}

export async function findAppTeamConfigs({
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

export async function findAppPermissionById(permissionId: string) {
  return db.query.appPermissions.findFirst({
    where: (appPermissions, { eq }) => eq(appPermissions.id, permissionId),
    columns: { editable: true },
  });
}

export async function createManyAppPermissionToRoleAssociations(
  db: Drizzle,
  data: z.infer<typeof zAppPermissionToTeamAppRoleCreateMany>,
) {
  await db
    .insert(appPermissionsToTeamAppRoles)
    .values(zAppPermissionToTeamAppRoleCreateMany.parse(data));
}

export async function removePermissionFromRole(
  db: Drizzle,
  {
    permissionId,
    appId,
  }: {
    permissionId: string;
    appId: string;
  },
) {
  await db.delete(appPermissionsToTeamAppRoles).where(
    inArray(
      appPermissionsToTeamAppRoles.appPermissionId,
      db
        .select({ id: appPermissions.id })
        .from(appPermissions)
        .where(
          and(
            eq(appPermissions.id, permissionId),
            eq(appPermissions.appId, appId),
          ),
        ),
    ),
  );
}

const getAppIdToAppTeamConfigSchemaUpdate = (
  appId: AppIdsWithUserAppTeamConfig,
) => appIdToAppTeamConfigSchema[appId].deepPartial();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const helpMe = getAppIdToAppTeamConfigSchemaUpdate(kodixCareAppId); //TODO: WTF is this

export async function upsertAppTeamConfig({
  appId,
  teamId,
  config,
}: {
  appId: AppIdsWithUserAppTeamConfig;
  teamId: string;
  config: z.infer<
    typeof helpMe //TODO: make dynamic based on app
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

export async function findUserAppTeamConfigs({
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

export async function installAppForTeam({
  appId,
  teamId,
  userId,
}: {
  appId: KodixAppId;
  teamId: string;
  userId: string;
}) {
  await db.transaction(async (tx) => {
    await tx.insert(appsToTeams).values({
      appId: appId,
      teamId: teamId,
    });

    //? 1. Get the default app roles for the app and create them
    const appRoleDefaultForApp = appRoles_defaultTree[appId];
    const toCreateDefaultAppRoles = appRoleDefaultForApp.appRoleDefaults.map(
      (defaultAppRole) => ({
        id: nanoid(),
        appId: appId,
        appRoleDefaultId: defaultAppRole.id,
        teamId: teamId,
      }),
    ) satisfies (typeof teamAppRoles.$inferInsert)[];

    await tx.insert(teamAppRoles).values(toCreateDefaultAppRoles);

    //? 2. Connect the permissions to the newly created roles if any   exists
    const toAddPermissions = toCreateDefaultAppRoles.flatMap((role) =>
      (appRoleDefaultForApp.appPermissions ?? []).map((permission) => ({
        appPermissionId: permission.id,
        teamAppRoleId: role.id,
      })),
    ) satisfies (typeof appPermissionsToTeamAppRoles.$inferInsert)[];

    if (toAddPermissions.length > 0)
      await tx.insert(appPermissionsToTeamAppRoles).values(toAddPermissions);

    //?3. Add the user to the admin role for the app
    const adminRoleForApp = toCreateDefaultAppRoles.find(
      (role) => role.appRoleDefaultId === appIdToAdminRole_defaultIdMap[appId],
    );
    if (!adminRoleForApp) throw new Error("Admin role not found"); //Each app should have a designated admin role

    await tx.insert(teamAppRolesToUsers).values({
      teamAppRoleId: adminRoleForApp.id,
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
