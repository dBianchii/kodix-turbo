import z from "zod";

import type { todos } from "@kdx/db/schema";

import { adjustDateToMinute, ZNanoId } from "../../..";

export const ZCreateInputSchema = z.object({
  assignedToUserId: ZNanoId.optional().nullish(),
  description: z.string().optional(),
  dueDate: z.date().transform(adjustDateToMinute).optional(),
  priority: z.number().optional(),
  status: z.custom<typeof todos.$inferInsert.status>().optional(),
  title: z.string(),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZUpdateInputSchema = z.object({
  assignedToUserId: ZNanoId.optional().nullish(),
  description: z.string().optional(),
  dueDate: z.date().transform(adjustDateToMinute).optional().nullish(),
  id: ZNanoId,
  priority: z.number().optional(),
  status: z.custom<typeof todos.$inferInsert.status>().optional(),
  title: z.string().optional(),
}); //TODO: investigate
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
