import { z } from "zod";

import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";

import { ZNanoId } from "../..";

export const ZCreateInputSchema = z.object({
  userId: ZNanoId,
  teamName: z.string().min(3).max(32, {
    message: "Team name must be at most 32 characters",
  }),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZGetOneInputSchema = z.object({
  teamId: ZNanoId,
});
export type TGetOneInputSchema = z.infer<typeof ZGetOneInputSchema>;

export const ZInstallAppInputSchema = z.object({
  appId: z.union([
    z.literal(todoAppId),
    z.literal(calendarAppId),
    z.literal(kodixCareAppId),
  ]),
});
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZRemoveUserSchema = z.object({
  userId: ZNanoId,
});
export type TRemoveUserSchema = z.infer<typeof ZRemoveUserSchema>;

export const ZUninstallAppInputSchema = z.object({
  appId: ZNanoId,
});
export type TUninstallAppInputSchema = z.infer<typeof ZUninstallAppInputSchema>;

export const ZUpdateInputSchema = z.object({
  teamId: ZNanoId,
  teamName: z
    .string()
    .min(3, { message: "Team name must be at least 3 characters" })
    .max(32, {
      message: "Team name must be at most 32 characters",
    }),
});
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
