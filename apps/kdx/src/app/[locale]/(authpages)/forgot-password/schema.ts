import { z } from "zod";

export const ZForgotPasswordSchema = z.object({
  email: z.string().email(),
});
