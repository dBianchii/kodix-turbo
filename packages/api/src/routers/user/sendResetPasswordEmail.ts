import { TRPCError } from "@trpc/server";

import type { TSendResetPasswordEmailInputSchema } from "@kdx/validators/trpc/user";
import { eq } from "@kdx/db";
import { nanoid } from "@kdx/db/nanoid";
import * as schema from "@kdx/db/schema";
import ResetPassword from "@kdx/react-email/reset-password";
import { kodixNotificationFromEmail } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../procedures";
import { resend } from "../../utils/email";

interface SendResetPasswordEmailOptions {
  ctx: TPublicProcedureContext;
  input: TSendResetPasswordEmailInputSchema;
}

export const sendResetPasswordEmail = async ({
  ctx,
  input,
}: SendResetPasswordEmailOptions) => {
  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, input.email),
    columns: { id: true },
  });

  if (!user)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });

  const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

  await ctx.db
    .delete(schema.resetPasswordTokens)
    .where(eq(schema.resetPasswordTokens.userId, user.id));
  const token = nanoid();
  await ctx.db.insert(schema.resetPasswordTokens).values({
    userId: user.id,
    token,
    tokenExpiresAt,
  });

  await resend.emails.send({
    from: kodixNotificationFromEmail,
    to: input.email,
    subject: "Kodix - Reset password",
    react: ResetPassword({ token }),
  });
};
