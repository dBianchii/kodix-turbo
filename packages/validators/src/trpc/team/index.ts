import { z } from "zod";

import { ZNanoId, ZUserId } from "../..";

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
  userId: ZUserId,
});
export type TRemoveUserSchema = z.infer<typeof ZRemoveUserSchema>;

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
