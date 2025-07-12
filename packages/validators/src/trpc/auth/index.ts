import { z } from "zod";

export const ZSignOutInputSchema = z
  .object({
    expoToken: z.string().optional(),
  })
  .optional();
export type TSignOutInputSchema = z.infer<typeof ZSignOutInputSchema>;
