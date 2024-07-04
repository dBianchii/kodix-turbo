import { z } from "zod";

export const ZSigninActionSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3).max(255),
  callbackUrl: z.string().optional(),
});
