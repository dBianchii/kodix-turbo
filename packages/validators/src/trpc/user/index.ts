import { z } from "zod";

import { ZNanoId } from "../..";

export const ZChangeNameInputSchema = z.object({ name: z.string().max(32) });
export type TChangeNameInputSchema = z.infer<typeof ZChangeNameInputSchema>;

export const ZGetNotificationsInputSchema = z.object({
  teamId: ZNanoId,

  from: z.date().optional(),
  to: z.date().optional(),
  page: z.coerce.number().default(1),
  channel: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
  message: z.string().optional(),
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
