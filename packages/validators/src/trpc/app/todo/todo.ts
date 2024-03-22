import { z } from "zod";

import type { schema } from "@kdx/db";
import { isNanoIdRegex } from "@kdx/shared";

export const ZCreateInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.custom<typeof schema.todos.$inferInsert.status>().optional(),
  assignedToUserId: z.string().regex(isNanoIdRegex).optional().nullish(),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZUpdateInputSchema = z.object({
  id: z.string().regex(isNanoIdRegex),
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.date().optional().nullish(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.custom<typeof schema.todos.$inferInsert.status>().optional(),
  assignedToUserId: z.string().regex(isNanoIdRegex).optional().nullish(),
}); //TODO: investigate
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
