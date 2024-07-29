import { z } from "zod";

import type { notifications } from "@kdx/db/schema";

import { ZNanoId } from "../..";

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;

export const ZGetNotificationsInputSchema = z.object({
  teamId: z.string().optional(),

  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().default(1),
  channel: z.custom<typeof notifications.$inferInsert.channel>().optional(),
  operator: z.enum(["and", "or"]).optional(),
  subject: z.string().optional(),
  perPage: z.coerce.number().default(10),
  sort: z.string().optional(),
});
export type TGetNotificationsInputSchema = z.infer<
  typeof ZGetNotificationsInputSchema
>;

export const ZSwitchActiveTeamInputSchema = z.object({
  teamId: ZNanoId,
});
export type TSwitchActiveTeamInputSchema = z.infer<
  typeof ZSwitchActiveTeamInputSchema
>;

export const ZDeleteNotificationsInputSchema = z.object({
  ids: z.string().array().min(1),
});
export type TDeleteNotificationsInputSchema = z.infer<
  typeof ZDeleteNotificationsInputSchema
>;

export const ZSignInByPasswordInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(31),
});
export type TSignInByPasswordInputSchema = z.infer<
  typeof ZSignInByPasswordInputSchema
>;

export const ZSignupWithPasswordInputSchema = z.object({
  name: z.string().min(3).max(31),
  email: z.string().email(),
  password: z.string().min(6).max(255),
  invite: z.string().optional(),
});
export type TSignupWithPasswordInputSchema = z.infer<
  typeof ZSignupWithPasswordInputSchema
>;

export const ZSendResetPasswordEmailInputSchema = z.object({
  email: z.string().email(),
});
export type TSendResetPasswordEmailInputSchema = z.infer<
  typeof ZSendResetPasswordEmailInputSchema
>;

export const ZChangePasswordInputSchema = z.object({
  token: z.string(),
  password: z.string().min(3).max(255),
});
export type TChangePasswordInputSchema = z.infer<
  typeof ZChangePasswordInputSchema
>;
