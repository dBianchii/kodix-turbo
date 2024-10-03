import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZCreateInputSchema,
  ZDeleteTeamInputSchema,
  ZLeaveTeamInputSchema,
  ZRemoveUserSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/team";

import { isTeamOwnerProcedure, protectedProcedure } from "../../procedures";
import { T } from "../../utils/locales";
import { appRoleRouter } from "./appRole/_router";
import { createHandler } from "./create.handler";
import { deleteTeamHandler } from "./deleteTeam.handler";
import { getActiveTeamHandler } from "./getActiveTeam.handler";
import { getAllForLoggedUserHandler } from "./getAllForLoggedUser.handler";
import { getAllUsersHandler } from "./getAllUsers.handler";
import { invitationRouter } from "./invitation/_router";
import { leaveTeamHandler } from "./leaveTeam.handler";
import { removeUserHandler } from "./removeUser.handler";
import { updateHandler } from "./update.handler";

export const teamRouter = {
  appRole: appRoleRouter,
  invitation: invitationRouter,
  create: protectedProcedure.input(ZCreateInputSchema).mutation(createHandler),
  getActiveTeam: protectedProcedure.query(getActiveTeamHandler),
  getAllForLoggedUser: protectedProcedure.query(getAllForLoggedUserHandler),
  getAllUsers: protectedProcedure.query(getAllUsersHandler),
  removeUser: isTeamOwnerProcedure
    .input(ZRemoveUserSchema)
    .mutation(removeUserHandler),
  update: isTeamOwnerProcedure
    .input(T(ZUpdateInputSchema))
    .mutation(updateHandler),
  leaveTeam: protectedProcedure
    .input(ZLeaveTeamInputSchema)
    .mutation(leaveTeamHandler),
  deleteTeam: isTeamOwnerProcedure
    .input(ZDeleteTeamInputSchema)
    .mutation(deleteTeamHandler),
} satisfies TRPCRouterRecord;
