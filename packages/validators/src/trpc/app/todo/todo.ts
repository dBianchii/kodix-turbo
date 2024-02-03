import { z } from "zod";

import { Status } from "@kdx/db";

export const ZCreateInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.nativeEnum(Status).optional(),
  assignedToUserId: z.string().cuid().optional().nullish(),
});
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

export const ZUpdateInputSchema = z.object({
  id: z.string().cuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.date().optional().nullish(),
  reminder: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.nativeEnum(Status).optional(),
  assignedToUserId: z.string().cuid().optional().nullish(),
});
export type TUpdateInputSchema = z.infer<typeof ZUpdateInputSchema>;
