import z from "zod/v4";

import type { todos } from "@kdx/db/schema";

import { adjustDateToMinute, ZNanoId } from "../../..";

export const ZCreateInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().transform(adjustDateToMinute).optional(),
  priority: z.number().optional(),
  status: z.custom<typeof todos.$inferInsert.status>().optional(),
  assignedToUserId: ZNanoId.optional().nullish(),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZUpdateInputSchema = z.object({
  id: ZNanoId,
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.date().transform(adjustDateToMinute).optional().nullish(),
  priority: z.number().optional(),
  status: z.custom<typeof todos.$inferInsert.status>().optional(),
  assignedToUserId: ZNanoId.optional().nullish(),
}); //TODO: investigate
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
