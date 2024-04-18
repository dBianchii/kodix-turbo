import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateInputSchema,
  ZInstallAppInputSchema,
  ZRemoveUserSchema,
  ZUninstallAppInputSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/team";

import { isTeamOwnerProcedure, protectedProcedure } from "../../procedures";
import { appRoleRouter } from "./appRole/_router";
import { createHandler } from "./create.handler";
import { getActiveTeamHandler } from "./getActiveTeam.handler";
import { getAllForLoggedUserHandler } from "./getAllForLoggedUser.handler";
import { getAllUsersHandler } from "./getAllUsers.handler";
import { installAppHandler } from "./installApp.handler";
import { invitationRouter } from "./invitation/_router";
import { removeUserHandler } from "./removeUser.handler";
import { uninstallAppHandler } from "./uninstallApp.handler";
import { updateHandler } from "./update.handler";

export const teamRouter = {
  appRole: appRoleRouter,
  invitation: invitationRouter,
  create: protectedProcedure.input(ZCreateInputSchema).mutation(createHandler),
  getActiveTeam: protectedProcedure.query(getActiveTeamHandler),
  getAllForLoggedUser: protectedProcedure.query(getAllForLoggedUserHandler),
  getAllUsers: protectedProcedure.query(getAllUsersHandler),
  installApp: isTeamOwnerProcedure
    .input(ZInstallAppInputSchema)
    .mutation(installAppHandler),
  removeUser: protectedProcedure
    .input(ZRemoveUserSchema)
    .mutation(removeUserHandler),
  uninstallApp: protectedProcedure
    .input(ZUninstallAppInputSchema)
    .mutation(uninstallAppHandler),
  update: protectedProcedure.input(ZUpdateInputSchema).mutation(updateHandler),
} satisfies TRPCRouterRecord;
