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
  create: protectedProcedure
    .input(ZCreateInputSchema)
    .mutation(async (opts) => await createHandler(opts)),
  getActiveTeam: protectedProcedure.query(
    async (opts) => await getActiveTeamHandler(opts),
  ),
  getAllForLoggedUser: protectedProcedure.query(
    async (opts) => await getAllForLoggedUserHandler(opts),
  ),
  getAllUsers: protectedProcedure.query(
    async (opts) => await getAllUsersHandler(opts),
  ),
  getOne: protectedProcedure
    .input(ZGetOneInputSchema)
    .query(async (opts) => await getOneHandler(opts)),
  installApp: isTeamOwnerProcedure
    .input(ZInstallAppInputSchema)
    .mutation(async (opts) => await installAppHandler(opts)),
  removeUser: protectedProcedure
    .input(ZRemoveUserSchema)
    .mutation(async (opts) => await removeUserHandler(opts)),
  uninstallApp: protectedProcedure
    .input(ZUninstallAppSchema)
    .mutation(async (opts) => await uninstallAppHandler(opts)),
  update: protectedProcedure
    .input(ZUpdateInputSchema)
    .mutation(async (opts) => await updateHandler(opts)),
} satisfies TRPCRouterRecord;
