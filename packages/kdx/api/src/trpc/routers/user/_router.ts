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
import { sendResetPasswordEmailHandler } from "./sendResetPasswordEmail";
import { signInByPasswordHandler } from "./signInByPassword.handler";
import { signupWithPasswordHandler } from "./signupWithPassword.handler";
import { switchActiveTeamHandler } from "./switchActiveTeam.handler";

export const userRouter = {
  changeName: protectedProcedure
    .input(T(ZChangeNameInputSchema))
    .mutation(changeNameHandler),
  changePassword: publicProcedure
    .input(ZChangePasswordInputSchema)
    .mutation(changePasswordHandler),
  deleteAccount: protectedProcedure.mutation(deleteAccountHandler),
  deleteNotifications: protectedProcedure
    .input(ZDeleteNotificationsInputSchema)
    .mutation(deleteNotificationsHandler),
  getInvitations: protectedProcedure.query(getInvitationsHandler),
  /** Gets all notifications for the selected teamId and also all their pending invitations */
  getNotifications: protectedProcedure
    .input(ZGetNotificationsInputSchema)
    .query(getNotificationsHandler),
  notifications: notificationsRouter,
  sendResetPasswordEmail: publicProcedure
    .input(ZSendResetPasswordEmailInputSchema)
    .mutation(sendResetPasswordEmailHandler),
  signInByPassword: publicProcedure
    .input(ZSignInByPasswordInputSchema)
    .mutation(signInByPasswordHandler),
  signupWithPassword: publicProcedure
    .input(ZSignupWithPasswordInputSchema)
    .mutation(signupWithPasswordHandler),
  switchActiveTeam: protectedProcedure
    .input(ZSwitchActiveTeamInputSchema)
    .mutation(switchActiveTeamHandler),
} satisfies TRPCRouterRecord;
