import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TInstallAppInputSchema } from "@kdx/validators/trpc/app";
import { and, eq } from "@kdx/db";
import { appRoles_defaultTree } from "@kdx/db/constants";
import { nanoid } from "@kdx/db/nanoid";
import {
  appPermissionsToTeamAppRoles,
  apps,
  appsToTeams,
  teamAppRoles,
  teamAppRolesToUsers,
  teams,
} from "@kdx/db/schema";
import { appIdToAdminRole_defaultIdMap } from "@kdx/shared";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";
import { invalidateUpstashCache } from "../../../sdks/upstash";

interface InstallAppOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInstallAppInputSchema;
}

export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  const installed = await ctx.db
    .select({ id: apps.id })
    .from(apps)
    .innerJoin(appsToTeams, eq(appsToTeams.appId, apps.id))
    .innerJoin(teams, eq(teams.id, appsToTeams.teamId))
    .where(
      and(
        eq(teams.id, ctx.session.user.activeTeamId),
        eq(apps.id, input.appId),
      ),
    )
    .then((res) => res[0]);

  const t = await getTranslations({ locale: ctx.locale });
  if (installed)
    throw new TRPCError({
      message: t("api.App already installed"),
      code: "BAD_REQUEST",
    });

  await ctx.db.transaction(async (tx) => {
    await tx.insert(appsToTeams).values({
      appId: input.appId,
      teamId: ctx.session.user.activeTeamId,
    });

    const appRoleDefaultForApp = appRoles_defaultTree[input.appId];

    //? 1. Get the default app roles for the app and create them
    const toCreateDefaultAppRoles = appRoleDefaultForApp.appRoleDefaults.map(
      (defaultAppRole) => ({
        id: nanoid(),
        appId: input.appId,
        appRoleDefaultId: defaultAppRole.id,
        teamId: ctx.session.user.activeTeamId,
      }),
    ) satisfies (typeof teamAppRoles.$inferInsert)[];

    await tx.insert(teamAppRoles).values(toCreateDefaultAppRoles);

    //? 2. Connect the permissions to the newly created roles if any exists
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
      (role) =>
        role.appRoleDefaultId === appIdToAdminRole_defaultIdMap[input.appId],
    );

    if (!adminRoleForApp)
      //Each app should have a designated admin role
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: t("api.Admin role not found"),
      });

    await tx.insert(teamAppRolesToUsers).values({
      teamAppRoleId: adminRoleForApp.id,
      userId: ctx.session.user.id,
    });
  });

  await invalidateUpstashCache("apps", {
    teamId: ctx.session.user.activeTeamId,
  });
};
