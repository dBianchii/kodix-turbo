import { TRPCError } from "@trpc/server";

import type { TSendResetPasswordEmailInputSchema } from "@kdx/validators/trpc/user";
import { nanoid } from "@kdx/db/nanoid";
import { authRepository } from "@kdx/db/repositories";
import ResetPassword from "@kdx/react-email/reset-password";
import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kdx/shared/constants";

import type { TPublicProcedureContext } from "../../procedures";
import { findUserByEmail } from "../../../../../db/src/repositories/userRepository";
import { resend } from "../../../sdks/email";

interface SendResetPasswordEmailOptions {
  ctx: TPublicProcedureContext;
  input: TSendResetPasswordEmailInputSchema;
}

export const sendResetPasswordEmailHandler = async ({
  ctx,
  input,
}: SendResetPasswordEmailOptions) => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ctx.t("api.User not found"),
    });
  }

  const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
  await authRepository.deleteAllResetPasswordTokensByUserId(user.id);

  const token = nanoid();
  await authRepository.createResetPasswordToken({
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
