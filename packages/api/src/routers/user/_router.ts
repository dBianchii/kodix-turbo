import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZChangeNameInputSchema,
  ZDeleteNotificationsInputSchema,
  ZGetNotificationsInputSchema,
  ZSwitchActiveTeamInputSchema,
} from "@kdx/validators/trpc/user";

import { protectedProcedure } from "../../procedures";
import { changeNameHandler } from "./changeName.handler";
import { deleteNotificationsHandler } from "./deleteNotifications.handler";
import { getInvitationsHandler } from "./getInvitations.handler";
import { getNotificationsHandler } from "./getNotifications.handler";
import { switchActiveTeamHandler } from "./switchActiveTeam.handler";

export const userRouter = {
  changeName: protectedProcedure
    .input(ZChangeNameInputSchema)
    .mutation(changeNameHandler),

  /** Gets all notifications for the selected teamId and also all their pending invitations */
  getNotifications: protectedProcedure
    .input(ZGetNotificationsInputSchema)
    .query(getNotificationsHandler),
  switchActiveTeam: protectedProcedure
    .input(ZSwitchActiveTeamInputSchema)
    .mutation(switchActiveTeamHandler),
  getInvitations: protectedProcedure.query(getInvitationsHandler),
  deleteNotifications: protectedProcedure
    .input(ZDeleteNotificationsInputSchema)
    .mutation(deleteNotificationsHandler),
} satisfies TRPCRouterRecord;
