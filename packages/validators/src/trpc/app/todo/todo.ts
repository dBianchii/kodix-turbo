import { z } from "zod";

import { insertTodosSchema } from "@kdx/db";

export const ZCreateInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: insertTodosSchema.pick({ status: true }),
  assignedToUserId: z.string().cuid().optional().nullish(),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZUpdateInputSchema = insertTodosSchema; //TODO: investigate
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
