import { z } from "zod";

import { ZNanoId } from "../..";

export const ZGetOneInputSchema = z.object({
  userId: ZNanoId,
});
export type TGetOneInputSchema = z.infer<typeof ZGetOneInputSchema>;

export const ZSwitchActiveTeamInputSchema = z.object({
  teamId: ZNanoId,
});
export type TSwitchActiveTeamInputSchema = z.infer<
  typeof ZSwitchActiveTeamInputSchema
>;

export const ZInstallAppInputSchema = z.object({
  appId: ZNanoId,
});
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;
