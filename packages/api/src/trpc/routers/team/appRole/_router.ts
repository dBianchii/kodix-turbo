import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZGetAllInputSchema,
  ZGetMyRolesInputSchema,
  ZGetPermissionsInputSchema,
  ZGetUsersWithRolesInputSchema,
  ZUpdatePermissionAssociationInputSchema,
  ZUpdateUserAssociationInputSchema,
} from "@kdx/validators/trpc/team/appRole";

import { appInstalledMiddleware } from "../../../middlewares";
import { isTeamOwnerProcedure, protectedProcedure } from "../../../procedures";
import { getAllHandler } from "./getAll.handler";
import { getMyRolesHandler } from "./getMyRoles.handler";
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
    .use(appInstalledMiddleware)
    .query(getUsersWithRolesHandler),
  updatePermissionAssociation: isTeamOwnerProcedure
    .input(ZUpdatePermissionAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(updatePermissionAssociationHandler),
  updateUserAssociation: isTeamOwnerProcedure
    .input(ZUpdateUserAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(updateUserAssociationHandler),
  getMyRoles: protectedProcedure
    .input(ZGetMyRolesInputSchema)
    .query(getMyRolesHandler),
} satisfies TRPCRouterRecord;
