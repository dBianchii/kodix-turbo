import type { TRPCRouterRecord } from "@trpc/server";

import {
  ZChangeNameInputSchema,
  ZChangePasswordInputSchema,
  ZDeleteNotificationsInputSchema,
  ZGetNotificationsInputSchema,
  ZSendResetPasswordEmailInputSchema,
  ZSignInByPasswordInputSchema,
  ZSignupWithPasswordInputSchema,
  ZSwitchActiveTeamInputSchema,
} from "@kdx/validators/trpc/user";

import { T } from "../../../utils/locales";
import { protectedProcedure, publicProcedure } from "../../procedures";
import { changeNameHandler } from "./changeName.handler";
import { changePasswordHandler } from "./changePassword.handler";
import { deleteAccountHandler } from "./deleteAccount.handler";
import { deleteNotificationsHandler } from "./deleteNotifications.handler";
import { getInvitationsHandler } from "./getInvitations.handler";
import { getNotificationsHandler } from "./getNotifications.handler";
import { notificationsRouter } from "./notifications/_router";
import { sendResetPasswordEmail } from "./sendResetPasswordEmail";
import { signInByPasswordHandler } from "./signInByPassword.handler";
import { signupWithPasswordHandler } from "./signupWithPassword.handler";
import { switchActiveTeamHandler } from "./switchActiveTeam.handler";

export const userRouter = {
  notifications: notificationsRouter,

  changeName: protectedProcedure
    .input(T(ZChangeNameInputSchema))
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
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
  signupWithPassword: publicProcedure
    .input(ZSignupWithPasswordInputSchema)
    .mutation(signupWithPasswordHandler),
  sendResetPasswordEmail: publicProcedure
    .input(ZSendResetPasswordEmailInputSchema)
    .mutation(sendResetPasswordEmail),
  changePassword: publicProcedure
    .input(ZChangePasswordInputSchema)
    .mutation(changePasswordHandler),
  deleteAccount: protectedProcedure.mutation(deleteAccountHandler),
} satisfies TRPCRouterRecord;
