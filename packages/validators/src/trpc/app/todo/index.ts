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

export const ZUpdateInputSchema = createInsertSchema(schema.todos, {
  id: ZNanoId,
  assignedToUserId: ZNanoId,
}).pick({
  id: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  status: true,
  reminder: true,
  assignedToUserId: true,
});
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
