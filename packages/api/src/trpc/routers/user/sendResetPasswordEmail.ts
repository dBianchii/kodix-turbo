import { TRPCError } from "@trpc/server";

import type { TSendResetPasswordEmailInputSchema } from "@kdx/validators/trpc/user";
import { nanoid } from "@kdx/db/nanoid";
import ResetPassword from "@kdx/react-email/reset-password";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kdx/shared";

import type { TPublicProcedureContext } from "../../procedures";
import { resend } from "../../../sdks/email";

interface SendResetPasswordEmailOptions {
  ctx: TPublicProcedureContext;
  input: TSendResetPasswordEmailInputSchema;
}

export const sendResetPasswordEmailHandler = async ({
  ctx,
  input,
}: SendResetPasswordEmailOptions) => {
  const { publicUserRepository, publicAuthRepository } = ctx.publicRepositories;
  const user = await publicUserRepository.findUserByEmail(input.email);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.User not found"),
    });
  }

  const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
  await publicAuthRepository.deleteAllResetPasswordTokensByUserId(user.id);

  const token = nanoid();
  await publicAuthRepository.createResetPasswordToken({
    userId: user.id,
    token,
    tokenExpiresAt,
  });

  await resend.emails.send({
    from: KODIX_NOTIFICATION_FROM_EMAIL,
    to: input.email,
    subject: ctx.t("api.Kodix - Reset your password"),
    react: ResetPassword({ token, t: ctx.t }),
  });
};
