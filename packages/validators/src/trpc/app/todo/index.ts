import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { schema } from "@kdx/db/schema";

import { ZNanoId } from "../../..";

export const ZCreateInputSchema = createInsertSchema(schema.todos, {
  title: z.string(),
}).pick({
  title: true,
  description: true,
  dueDate: true,
  reminder: true,
  priority: true,
  status: true,
  assignedToUserId: true,
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
