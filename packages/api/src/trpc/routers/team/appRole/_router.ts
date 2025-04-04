import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZGetMyRolesInputSchema,
  ZGetUsersWithRolesInputSchema,
  ZUpdateUserAssociationInputSchema,
} from "@kdx/validators/trpc/team/appRole";

import { appInstalledMiddleware } from "../../../middlewares";
import { isTeamOwnerProcedure, protectedProcedure } from "../../../procedures";
import { getMyRolesHandler } from "./getMyRoles.handler";
import { getUsersWithRolesHandler } from "./getUsersWithRoles.handler";
import { updateUserAssociationHandler } from "./updateUserAssociation.handler";

export const appRoleRouter = {
  /**Gets all users in team, with added role information for app */
  getUsersWithRoles: isTeamOwnerProcedure
    .input(ZGetUsersWithRolesInputSchema)
    .use(appInstalledMiddleware)
    .query(getUsersWithRolesHandler),
  updateUserAssociation: isTeamOwnerProcedure
    .input(ZUpdateUserAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(updateUserAssociationHandler),
  getMyRoles: protectedProcedure
    .input(ZGetMyRolesInputSchema)
    .query(getMyRolesHandler),
} satisfies TRPCRouterRecord;
