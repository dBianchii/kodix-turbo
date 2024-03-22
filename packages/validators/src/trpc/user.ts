import { z } from "zod";

import { isNanoIdRegex } from "@kdx/shared";

export const ZGetOneInputSchema = z.object({
  userId: z.string().regex(isNanoIdRegex),
});
export type TGetOneInputSchema = z.infer<typeof ZGetOneInputSchema>;

export const ZSwitchActiveTeamInputSchema = z.object({
  teamId: z.string().regex(isNanoIdRegex),
});
export type TSwitchActiveTeamInputSchema = z.infer<
  typeof ZSwitchActiveTeamInputSchema
>;

export const ZInstallAppInputSchema = z.object({
  appId: z.string().regex(isNanoIdRegex),
});
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;
