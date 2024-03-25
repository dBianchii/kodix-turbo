import { z } from "zod";

import { ZInsertCareTaskSchema } from "@kdx/db";

export const ZDoCheckoutForShiftInputSchema = z.date().default(new Date());
export type TDoCheckoutForShiftInputSchema = z.infer<
  typeof ZDoCheckoutForShiftInputSchema
>;

export const ZGetCareTasksInputSchema = z.object({
  dateStart: z.date(),
  dateEnd: z.date(),
});
export type TGetCareTasksInputSchema = z.infer<typeof ZGetCareTasksInputSchema>;

export const ZSaveCareTaskInputSchema = ZInsertCareTaskSchema.pick({
  id: true,
  doneByUserId: true,
  doneAt: true,
  details: true,
});
export type TSaveCareTaskInputSchema = z.infer<typeof ZSaveCareTaskInputSchema>;
