import { z } from "zod";

import { ZNanoId } from "../../..";

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
  id: ZNanoId,
  doneByUserId: ZNanoId.nullable().optional(),
  doneAt: z.date().nullable().optional(),
  details: z.string().nullable().optional(),
});
export type TSaveCareTaskInputSchema = z.infer<typeof ZSaveCareTaskInputSchema>;
