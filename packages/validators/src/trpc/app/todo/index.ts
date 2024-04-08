import { z } from "zod";

import type { schema } from "@kdx/db";

import { ZNanoId } from "../../..";

export const ZCreateInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.custom<typeof schema.todos.$inferInsert.status>().optional(),
  assignedToUserId: ZNanoId.optional().nullish(),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZUpdateInputSchema = z.object({
  id: ZNanoId,
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.date().optional().nullish(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.custom<typeof schema.todos.$inferInsert.status>().optional(),
  assignedToUserId: ZNanoId.optional().nullish(),
}); //TODO: investigate
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
