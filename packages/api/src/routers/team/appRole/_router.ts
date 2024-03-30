import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZGetAllInputSchema,
  ZGetPermissionsInputSchema,
  ZGetUsersWithRolesInputSchema,
  ZUpdatePermissionAssociationInputSchema,
  ZUpdateUserAssociationInputSchema,
} from "@kdx/validators/trpc/team/appRole";

import { isTeamOwnerProcedure } from "../../../customProcedures";
import { appInstalledMiddleware } from "../../../middlewares";
import { getAllHandler } from "./getAll.handler";
import { getPermissionsHandler } from "./getPermissions.handler";
import { getUsersWithRolesHandler } from "./getUsersWithRoles.handler";
import { updatePermissionAssociationHandler } from "./updatePermissionAssociation.handler";
import { updateUserAssociationHandler } from "./updateUserAssociation.handler";

export const appRoleRouter = {
  getAll: isTeamOwnerProcedure.input(ZGetAllInputSchema).query(getAllHandler),
  getPermissions: isTeamOwnerProcedure
    .input(ZGetPermissionsInputSchema)
    .query(getPermissionsHandler),
  /**Gets all users in team, with added role information for app */
  getUsersWithRoles: isTeamOwnerProcedure
    .input(ZGetUsersWithRolesInputSchema)
    .query(getUsersWithRolesHandler),
  updatePermissionAssociation: isTeamOwnerProcedure
    .input(ZUpdatePermissionAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(updatePermissionAssociationHandler),
  updateUserAssociation: isTeamOwnerProcedure
    .input(ZUpdateUserAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(updateUserAssociationHandler),
} satisfies TRPCRouterRecord;
