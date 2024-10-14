import { z } from "zod";

export const ZSaveExpoTokenInputSchema = z.object({
  expoToken: z.string(),
});
export type TSaveExpoTokenInputSchema = z.infer<
  typeof ZSaveExpoTokenInputSchema
>;
