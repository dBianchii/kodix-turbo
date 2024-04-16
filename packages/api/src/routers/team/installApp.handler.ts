import { TRPCError } from "@trpc/server";

import type { TInstallAppInputSchema } from "@kdx/validators/trpc/team";
import { and, eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";
import { appIdToAdminRole_defaultIdMap, nanoid } from "@kdx/shared";

import type { TIsTeamOwnerProcedureContext } from "../../procedures";

interface InstallAppOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TInstallAppInputSchema;
}

export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  const installed = await ctx.db
    .select({ id: schema.apps.id })
    .from(schema.apps)
    .innerJoin(schema.appsToTeams, eq(schema.appsToTeams.appId, schema.apps.id))
    .innerJoin(schema.teams, eq(schema.teams.id, schema.appsToTeams.teamId))
    .where(
      and(
        eq(schema.teams.id, ctx.session.user.activeTeamId),
        eq(schema.apps.id, input.appId),
      ),
    )
    .then((res) => res[0]);

  if (installed)
    throw new TRPCError({
      message: "App already installed",
      code: "BAD_REQUEST",
    });

  await ctx.db.transaction(async (tx) => {
    await tx.insert(schema.appsToTeams).values({
      appId: input.appId,
      teamId: ctx.session.user.activeTeamId,
    });
    const defaultAppRoles = await tx.query.appRoleDefaults.findMany({
      where: (defaultAppRole, { eq }) => eq(defaultAppRole.appId, input.appId),
      columns: {
        appId: true,
        maxUsers: true,
        minUsers: true,
        description: true,
        id: true,
        name: true,
      },
      with: {
        AppPermissionsToAppRoleDefaults: true,
      },
    });

    const toCopyAppRoles = defaultAppRoles.map((role) => ({
      id: nanoid(),
      appId: role.appId,
      name: role.name,
      description: role.description,
      maxUsers: role.maxUsers,
      minUsers: role.minUsers,
      teamId: ctx.session.user.activeTeamId,
      appRoleDefaultId: role.id,
      AppPermissionsToAppRoleDefaults: role.AppPermissionsToAppRoleDefaults,
    }));

    //? 1. Insert the copied roles
    await tx.insert(schema.teamAppRoles).values(
      toCopyAppRoles.map((role) => {
        const { AppPermissionsToAppRoleDefaults: _, ...rest } = role;

        return rest;
      }),
    );

    //? 2. Also connect the permissions to the copied roles
    const toConnectPermissions = toCopyAppRoles
      .filter((role) => role.AppPermissionsToAppRoleDefaults.length > 0)
      .flatMap((role) =>
        role.AppPermissionsToAppRoleDefaults.map((permission) => ({
          teamAppRoleId: role.id,
          appPermissionId: permission.appPermissionId,
        })),
      );

    if (toConnectPermissions.length > 0)
      await tx
        .insert(schema.appPermissionsToTeamAppRoles)
        .values(toConnectPermissions);

    const adminRoleForApp = toCopyAppRoles.find(
      (role) =>
        role.appRoleDefaultId === appIdToAdminRole_defaultIdMap[input.appId],
    );
    if (adminRoleForApp)
      await tx.insert(schema.teamAppRolesToUsers).values({
        teamAppRoleId: adminRoleForApp.id,
        userId: ctx.session.user.id,
      });
  });
};
