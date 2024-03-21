import { z } from "zod";

export const ZGetOneInputSchema = z.object({ userId: z.string().uuid() });
export type TGetOneInputSchema = z.infer<typeof ZGetOneInputSchema>;

export const ZSwitchActiveTeamInputSchema = z.object({
  teamId: z.string().uuid(),
});
export type TSwitchActiveTeamInputSchema = z.infer<
  typeof ZSwitchActiveTeamInputSchema
>;

export const ZInstallAppInputSchema = z.object({ appId: z.string().uuid() });
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;
