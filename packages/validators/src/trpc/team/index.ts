import z from "zod/v4";

import type { IsomorficT } from "@kdx/locales";

import { ZNanoId } from "../..";

export const ZCreateInputSchema = z.object({
  teamName: z.string().min(3).max(32, {
    message: "Team name must be between 3 and 32 characters",
  }),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZGetOneInputSchema = z.object({
  teamId: ZNanoId,
});
export type TGetOneInputSchema = z.infer<typeof ZGetOneInputSchema>;

export const ZRemoveUserSchema = z.object({
  userId: ZNanoId,
});
export type TRemoveUserSchema = z.infer<typeof ZRemoveUserSchema>;

export const ZUpdateInputSchema = (t: IsomorficT) =>
  z.object({
    teamId: ZNanoId,
    teamName: z
      .string()
      .min(3, {
        message: t("validators.Team name must be at least 3 characters"),
      })
      .max(32, {
        message: t("validators.Team name must be at most 32 characters"),
      }),
  });
export type TUpdateInputSchema = z.infer<ReturnType<typeof ZUpdateInputSchema>>;

export const ZLeaveTeamInputSchema = z.object({ teamId: ZNanoId });
export type TLeaveTeamInputSchema = z.infer<typeof ZLeaveTeamInputSchema>;

export const ZDeleteTeamInputSchema = z.object({
  teamNameConfirmation: z.string(),
  teamId: ZNanoId,
});
export type TDeleteTeamInputSchema = z.infer<typeof ZDeleteTeamInputSchema>;
