import { z } from "zod";

import { ZNanoId } from "../..";

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;

export const ZSwitchActiveTeamInputSchema = z.object({
  teamId: ZNanoId,
});
export type TSwitchActiveTeamInputSchema = z.infer<
  typeof ZSwitchActiveTeamInputSchema
>;
