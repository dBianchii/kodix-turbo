import { z } from "zod";

export const ZVerifyMagicLinkInputSchema = z.object({
  token: z.string(),
});

export type TVerifyMagicLinkInputSchema = z.infer<
  typeof ZVerifyMagicLinkInputSchema
>;
