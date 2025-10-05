import z from "zod";

export const ZSigninActionSchema = z.object({
  callbackUrl: z.string().optional(),
  email: z.email(),
  password: z.string().min(3).max(255),
});
