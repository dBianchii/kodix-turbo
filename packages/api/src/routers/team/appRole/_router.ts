import {
  ZGetAllInputSchema,
  ZGetPermissionsInputSchema,
  ZGetUsersWithRolesInputSchema,
  ZUpdatePermissionAssociationInputSchema,
  ZUpdateUserAssociationInputSchema,
} from "@kdx/validators/trpc/team/appRole";

import { isTeamOwnerProcedure } from "../../../customProcedures";
import { appInstalledMiddleware } from "../../../middlewares";
import { createTRPCRouter } from "../../../trpc";
import { getAllHandler } from "./getAll.handler";
import { getPermissionsHandler } from "./getPermissions.handler";
import { getUsersWithRolesHandler } from "./getUsersWithRoles.handler";
import { updatePermissionAssociationHandler } from "./updatePermissionAssociation.handler";
import { updateUserAssociationHandler } from "./updateUserAssociation.handler";

export const appRoleRouter = createTRPCRouter({
  getAll: isTeamOwnerProcedure
    .input(ZGetAllInputSchema)
    .query(async (opts) => await getAllHandler(opts)),
  getPermissions: isTeamOwnerProcedure
    .input(ZGetPermissionsInputSchema)
    .query(async (opts) => await getPermissionsHandler(opts)),
  /**Gets all users in team, with added role information for app */
  getUsersWithRoles: isTeamOwnerProcedure
    .input(ZGetUsersWithRolesInputSchema)
    .query(async (opts) => await getUsersWithRolesHandler(opts)),
  updatePermissionAssociation: isTeamOwnerProcedure
    .input(ZUpdatePermissionAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(async (opts) => await updatePermissionAssociationHandler(opts)),
  updateUserAssociation: isTeamOwnerProcedure
    .input(ZUpdateUserAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(async (opts) => await updateUserAssociationHandler(opts)),
});
