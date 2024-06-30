import { z } from "zod";

export const ZSignUpActionSchema = z.object({
  name: z.string().min(3).max(31),
  email: z.string().email(),
  password: z.string().min(6).max(255),
  agreeToTOS: z
    .boolean()
    .default(false)
    .refine((val) => !!val, {
      message: "You must agree to the terms of service",
    }),
  invite: z.string().optional(),
});
