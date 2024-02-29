import {
  ZGetAllInputSchema,
  ZGetUsersWithRolesInputSchema,
  ZUpdateUserAssociationInputSchema,
} from "@kdx/validators/trpc/team/appRole";

import { isTeamOwnerProcedure } from "../../../customProcedures";
import { appInstalledMiddleware } from "../../../middlewares";
import { createTRPCRouter } from "../../../trpc";
import { getAllHandler } from "./getAll.handler";
import { getUsersWithRolesHandler } from "./getUsersWithRoles.handler";
import { updateUserAssociationHandler } from "./updateUserAssociation.handler";

export const appRoleRouter = createTRPCRouter({
  getAll: isTeamOwnerProcedure
    .input(ZGetAllInputSchema)
    .query(async (opts) => await getAllHandler(opts)),
  /**Gets all users in team, with added role information for app */
  getUsersWithRoles: isTeamOwnerProcedure
    .input(ZGetUsersWithRolesInputSchema)
    .query(async (opts) => await getUsersWithRolesHandler(opts)),
  updateUserAssociation: isTeamOwnerProcedure
    .input(ZUpdateUserAssociationInputSchema)
    .use(appInstalledMiddleware)
    .mutation(async (opts) => await updateUserAssociationHandler(opts)),
});
