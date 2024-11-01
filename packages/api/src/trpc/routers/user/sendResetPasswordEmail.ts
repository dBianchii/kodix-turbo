import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TSendResetPasswordEmailInputSchema } from "@kdx/validators/trpc/user";
import { eq } from "@kdx/db";
import { nanoid } from "@kdx/db/nanoid";
import { resetPasswordTokens } from "@kdx/db/schema";
import ResetPassword from "@kdx/react-email/reset-password";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../procedures";
import { resend } from "../../../sdks/email";

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

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.User not found"),
    });
  }

  const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

  await ctx.db
    .delete(resetPasswordTokens)
    .where(eq(resetPasswordTokens.userId, user.id));
  const token = nanoid();
  await ctx.db.insert(resetPasswordTokens).values({
    userId: user.id,
    token,
    tokenExpiresAt,
  });

  await resend.emails.send({
    from: KODIX_NOTIFICATION_FROM_EMAIL,
    to: input.email,
    subject: ctx.t("api.Kodix - Reset your password"),
    react: ResetPassword({ token }),
  });
};
