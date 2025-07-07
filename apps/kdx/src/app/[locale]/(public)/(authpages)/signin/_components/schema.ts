import { z } from "zod/v4";

export const ZSigninActionSchema = z.object({
  email: z.email(),
  password: z.string().min(3).max(255),
  callbackUrl: z.string().optional(),
});
