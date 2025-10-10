import { KODIX_NOTIFICATION_FROM_EMAIL } from "@kodix/shared/constants";
import { nanoid } from "@kodix/shared/utils";
import { TRPCError } from "@trpc/server";

import type { TSendResetPasswordEmailInputSchema } from "@kdx/validators/trpc/user";
import { authRepository, userRepository } from "@kdx/db/repositories";
import ResetPassword from "@kdx/react-email/reset-password";

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
  const user = await userRepository.findUserByEmail(input.email);

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
    token,
    tokenExpiresAt,
    userId: user.id,
  });

  await resend.emails.send({
    from: KODIX_NOTIFICATION_FROM_EMAIL,
    react: ResetPassword({ t: ctx.t, token }),
    subject: ctx.t("api.Kodix - Reset your password"),
    to: input.email,
  });
};
