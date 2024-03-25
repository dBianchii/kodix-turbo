import { z } from "zod";

import { zNanoId } from "..";

export const ZGetOneInputSchema = z.object({
  userId: zNanoId,
});
export type TGetOneInputSchema = z.infer<typeof ZGetOneInputSchema>;

export const ZSwitchActiveTeamInputSchema = z.object({
  teamId: zNanoId,
});
export type TSwitchActiveTeamInputSchema = z.infer<
  typeof ZSwitchActiveTeamInputSchema
>;

export const ZInstallAppInputSchema = z.object({
  appId: zNanoId,
});
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;
