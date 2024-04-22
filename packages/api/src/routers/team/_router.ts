import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateInputSchema,
  ZRemoveUserSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/team";

import { protectedProcedure } from "../../procedures";
import { appRoleRouter } from "./appRole/_router";
import { createHandler } from "./create.handler";
import { getActiveTeamHandler } from "./getActiveTeam.handler";
import { getAllForLoggedUserHandler } from "./getAllForLoggedUser.handler";
import { getAllUsersHandler } from "./getAllUsers.handler";
import { invitationRouter } from "./invitation/_router";
import { removeUserHandler } from "./removeUser.handler";
import { updateHandler } from "./update.handler";

export const teamRouter = {
  appRole: appRoleRouter,
  invitation: invitationRouter,
  create: protectedProcedure.input(ZCreateInputSchema).mutation(createHandler),
  getActiveTeam: protectedProcedure.query(getActiveTeamHandler),
  getAllForLoggedUser: protectedProcedure.query(getAllForLoggedUserHandler),
  getAllUsers: protectedProcedure.query(getAllUsersHandler),
  removeUser: protectedProcedure
    .input(ZRemoveUserSchema)
    .mutation(removeUserHandler),
  update: protectedProcedure.input(ZUpdateInputSchema).mutation(updateHandler),
} satisfies TRPCRouterRecord;
