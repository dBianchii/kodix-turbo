import {
  ZCreateInputSchema,
  ZRemoveUserSchema,
  ZUpdateInputSchema,
} from "@kdx/validators/trpc/team";

import { createTRPCRouter } from "~/trpc";
import { isTeamOwnerProcedure, protectedProcedure } from "../../procedures";
import { appRoleRouter } from "./appRole/_appRole.router";
import { createHandler } from "./create.handler";
import { getActiveTeamHandler } from "./getActiveTeam.handler";
import { getAllForLoggedUserHandler } from "./getAllForLoggedUser.handler";
import { getAllUsersHandler } from "./getAllUsers.handler";
import { invitationRouter } from "./invitation/_invitation.router";
import { removeUserHandler } from "./removeUser.handler";
import { updateHandler } from "./update.handler";

export const teamRouter = createTRPCRouter({
  appRole: appRoleRouter,
  invitation: invitationRouter,
  create: protectedProcedure.input(ZCreateInputSchema).mutation(createHandler),
  getActiveTeam: protectedProcedure.query(getActiveTeamHandler),
  getAllForLoggedUser: protectedProcedure.query(getAllForLoggedUserHandler),
  getAllUsers: protectedProcedure.query(getAllUsersHandler),
  removeUser: protectedProcedure
    .input(ZRemoveUserSchema)
    .mutation(removeUserHandler),
  update: isTeamOwnerProcedure
    .input(ZUpdateInputSchema)
    .mutation(updateHandler),
});
