import z from "zod/v4";

import { ZNanoId } from "../../..";

export const ZAcceptInputSchema = z.object({
  invitationId: ZNanoId,
});
export type TAcceptInputSchema = z.infer<typeof ZAcceptInputSchema>;

export const ZDeclineInputSchema = z.object({
  invitationId: ZNanoId,
});
export type TDeclineInputSchema = z.infer<typeof ZDeclineInputSchema>;

export const ZDeleteInputSchema = z.object({
  invitationId: ZNanoId,
});
export type TDeleteInputSchema = z.infer<typeof ZDeleteInputSchema>;

export const ZInviteInputSchema = z.object({
  teamId: ZNanoId,
  to: z
    .email()
    .min(1, { message: "At least one email is required in the 'to' field" })
    .or(
      z.email().array().min(1, {
        message: "At least one email is required in the 'to' field",
      }),
    )
    .transform((value) => {
      if (Array.isArray(value)) return value;
      return [value];
    }),
});
export type TInviteInputSchema = z.infer<typeof ZInviteInputSchema>;
