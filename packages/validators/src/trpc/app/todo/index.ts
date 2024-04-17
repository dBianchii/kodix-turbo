import type { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

import { schema } from "@kdx/db/schema";

import { NANOID_REGEX, ZNanoId } from "../../..";

export const ZCreateInputSchema = createInsertSchema(schema.todos, {
  assignedToUserId: (schema) => schema.assignedToUserId.regex(NANOID_REGEX),
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
  assignedToUserId: (schema) => schema.assignedToUserId.regex(NANOID_REGEX),
  title: (schema) => schema.title.optional(),
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
