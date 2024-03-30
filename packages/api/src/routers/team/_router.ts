import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateInputSchema,
  ZGetOneInputSchema,
  ZInstallAppInputSchema,
  ZRemoveUserSchema,
  ZUninstallAppSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/team";

import { isTeamOwnerProcedure } from "../../customProcedures";
import { protectedProcedure } from "../../trpc";
import { appRoleRouter } from "./appRole/_router";
import { createHandler } from "./create.handler";
import { getActiveTeamHandler } from "./getActiveTeam.handler";
import { getAllForLoggedUserHandler } from "./getAllForLoggedUser.handler";
import { getAllUsersHandler } from "./getAllUsers.handler";
import { getOneHandler } from "./getOne.handler";
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
  getOne: protectedProcedure.input(ZGetOneInputSchema).query(getOneHandler),
  installApp: isTeamOwnerProcedure
    .input(ZInstallAppInputSchema)
    .mutation(installAppHandler),
  removeUser: protectedProcedure
    .input(ZRemoveUserSchema)
    .mutation(removeUserHandler),
  uninstallApp: protectedProcedure
    .input(ZUninstallAppSchema)
    .mutation(uninstallAppHandler),
  update: protectedProcedure.input(ZUpdateInputSchema).mutation(updateHandler),
} satisfies TRPCRouterRecord;
