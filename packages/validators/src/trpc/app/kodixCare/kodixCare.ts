import { z } from "zod";

import { zNanoId } from "../../..";

export const ZDoCheckoutForShiftInputSchema = z.date().default(new Date());
export type TDoCheckoutForShiftInputSchema = z.infer<
  typeof ZDoCheckoutForShiftInputSchema
>;

export const ZGetCareTasksInputSchema = z.object({
  dateStart: z.date(),
  dateEnd: z.date(),
});
export type TGetCareTasksInputSchema = z.infer<typeof ZGetCareTasksInputSchema>;

export const ZSaveCareTaskInputSchema = z.object({
  id: zNanoId,
  doneByUserId: zNanoId.optional(),
  doneAt: z.date().optional(),
  details: z.string().optional(),
});
export type TSaveCareTaskInputSchema = z.infer<typeof ZSaveCareTaskInputSchema>;
