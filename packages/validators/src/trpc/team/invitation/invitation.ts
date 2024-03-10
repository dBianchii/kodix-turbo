import { z } from "zod";

export const ZAcceptInputSchema = z.object({
  invitationId: z.string().cuid(),
});
export type TAcceptInputSchema = z.infer<typeof ZAcceptInputSchema>;

export const ZDeclineInputSchema = z.object({
  invitationId: z.string().cuid(),
});
export type TDeclineInputSchema = z.infer<typeof ZDeclineInputSchema>;

export const ZDeleteUserSchema = z.object({
  invitationId: z.string().cuid(),
});
export type TDeleteUserSchema = z.infer<typeof ZDeleteUserSchema>;

export const ZInviteInputSchema = z.object({
  teamId: z.string().cuid(),
  to: z
    .string()
    .email()
    .min(1, { message: "At least one email is required in the 'to' field" })
    .or(
      z.string().email().array().min(1, {
        message: "At least one email is required in the 'to' field",
      }),
    )
    .transform((value) => {
      if (Array.isArray(value)) return value;
      else return [value];
    }),
});
export type TInviteInputSchema = z.infer<typeof ZInviteInputSchema>;
