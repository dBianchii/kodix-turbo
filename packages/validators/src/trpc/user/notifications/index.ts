import z from "zod/v4";

export const ZSaveExpoTokenInputSchema = z.object({
  expoToken: z.string(),
});
export type TSaveExpoTokenInputSchema = z.infer<
  typeof ZSaveExpoTokenInputSchema
>;
