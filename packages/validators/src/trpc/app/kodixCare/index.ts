import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { schema } from "@kdx/db/schema";

import { ZNanoId } from "../../..";

export const ZDoCheckoutForShiftInputSchema = z.object({
  date: z.date().default(new Date()),
});
export type TDoCheckoutForShiftInputSchema = z.infer<
  typeof ZDoCheckoutForShiftInputSchema
>;

export const ZGetCareTasksInputSchema = z.object({
  dateStart: z.date(),
  dateEnd: z.date(),
});
export type TGetCareTasksInputSchema = z.infer<typeof ZGetCareTasksInputSchema>;

export const ZSaveCareTaskInputSchema = createInsertSchema(schema.careTasks, {
  id: ZNanoId,
  doneByUserId: ZNanoId,
}).pick({
  id: true,
  doneByUserId: true,
  doneAt: true,
  details: true,
});
export type TSaveCareTaskInputSchema = z.infer<typeof ZSaveCareTaskInputSchema>;

export const ZUnlockMoreTasksInputSchema = z.object({
  selectedTimestamp: z.date(),
});
export type TUnlockMoreTasksInputSchema = z.infer<
  typeof ZUnlockMoreTasksInputSchema
>;
