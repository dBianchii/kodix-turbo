import { z } from "zod";

import { ZNanoId } from "../..";
import { ClientOrServerT } from "../../utils/withT";

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

export const ZUpdateInputSchema = (t: ClientOrServerT) =>
  z.object({
    teamId: ZNanoId,
    teamName: z.string().regex(/^[a-zA-Z0-9_]*$/, {
      message: t("customErrors.admin_username_error"),
    }),
    // .min(3, {
    //   message: "admin_username_error",
    // })
    // .max(32)
    // .refine((value) => value !== "admin", {
    //   params: { i18n: "admin_username_error" },
    // }),
  });
export type TUpdateInputSchema = z.infer<ReturnType<typeof ZUpdateInputSchema>>;

export const ZLeaveTeamInputSchema = z.object({ teamId: ZNanoId });
export type TLeaveTeamInputSchema = z.infer<typeof ZLeaveTeamInputSchema>;
